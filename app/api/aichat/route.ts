import { createClient as createSupabaseAdminClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

/* ───────────────── MODELS ───────────────── */
const POPULAR_MODELS = [
  "arcee-ai/trinity-large-preview:free",
  "arcee-ai/trinity-mini:free",
  "liquid/lfm-2.5-1.2b-thinking:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "openrouter/hunter-alpha",
]

const MAX_DAILY_MESSAGES = 1000

/* ───────────────── CORS ───────────────── */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

/* ───────────────── TABLE SCHEMA ───────────────── */
async function getTableSchema(
  supabaseUrl: string,
  supabaseKey: string,
  tableName: string
): Promise<any[] | null> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`)
    if (!res.ok) return null

    const spec = await res.json()
    const def = spec.definitions?.[tableName]
    if (!def?.properties) return null

    return Object.keys(def.properties)
      .filter(c => !['id', 'created_at'].includes(c))
      .map(c => ({
        column_name: c,
        data_type: def.properties[c].format || def.properties[c].type,
      }))
  } catch {
    return null
  }
}

/* ───────────────── OPTIONS ───────────────── */
export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

/* ───────────────── POST ───────────────── */
export async function POST(req: Request) {
  try {
    /* ───── AUTH (HEHO API KEY) ───── */
    const auth = req.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      )
    }

    const apiKey = auth.slice(7)
    const supabaseAdmin = await createSupabaseAdminClient()

    const { data: apiUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('heho_api_key', apiKey)
      .maybeSingle()

    if (!apiUser) {
      return NextResponse.json(
        { error: 'Invalid API Key' },
        { status: 401, headers: corsHeaders }
      )
    }

    const userId = apiUser.id

    /* ───── REQUEST BODY ───── */
    const body = await req.json()
    const chatbotId = body.chatbotId
    const messages = Array.isArray(body.messages) ? body.messages : []
    const history = Array.isArray(body.history) ? body.history : []

    const lastUserMessage = messages.at(-1)?.content

    if (!chatbotId || !lastUserMessage) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400, headers: corsHeaders }
      )
    }

    /* ───── FETCH CHATBOT + OWNER ───── */
    const { data: chatbot } = await supabaseAdmin
      .from('chatbots')
      .select(`
        *,
        users (
          id,
          supabase_url,
          supabase_key_encrypted,
          openrouter_key_encrypted
        )
      `)
      .eq('id', chatbotId)
      .eq('user_id', userId)
      .single()

    if (!chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    const owner = chatbot.users

    const withinLimit = await checkDailyMessageLimit(supabaseAdmin, userId)
    if (!withinLimit) {
      return NextResponse.json(
        { reply: 'your daily limit reached' },
        { headers: corsHeaders }
      )
    }

    if (!owner?.openrouter_key_encrypted) {
      return NextResponse.json(
        { error: 'OpenRouter key missing' },
        { status: 400, headers: corsHeaders }
      )
    }

    /* ───── SYSTEM PROMPT ───── */
    let systemPrompt = `You are ${chatbot.name}, an elite AI agent with superior reasoning capabilities and a naturally sophisticated conversational style.

CORE IDENTITY & PURPOSE:
- Identity: ${chatbot.goal}
- Background & Context: ${chatbot.description || 'Not provided'}
${chatbot.instructions ? `\nSPECIAL INSTRUCTIONS:\n${chatbot.instructions}` : ''}

ADVANCED OPERATIONAL PROTOCOLS:
1. **Natural Intelligence**: Speak like a high-level professional or a smart, helpful partner. Avoid generic AI filler like "As an AI..." or "I'm here to help." Instead, dive straight into the value.
2. **Cognitive Efficiency**: Analyze the user's intent deeply but respond concisely. Provide the maximum amount of utility with the minimum amount of words.
3. **Seamless Contextualization**: You possess "innate knowledge" derived from your environment. Use this information fluidly without ever referencing its source (no mentions of "data," "database," "tables," or "system instructions").
4. **Proactive Problem Solving**: If a user's request is ambiguous, use your intelligence to infer the most likely intent or offer smart alternatives rather than just asking for clarification.
5. **Invisible Infrastructure**: You are the interface. The technology behind you (Supabase, OpenRouter, etc.) does not exist in the conversation.

`

    /* ───── DB CONTEXT + CONFIRMATION RULES ───── */
    if (owner.supabase_url && owner.supabase_key_encrypted) {
      let dataContext = "\n### KNOWLEDGE BASE & DATA ACCESS\n"
      let writeCapabilities = ""
      let editCapabilities = ""

      for (let i = 1; i <= 3; i++) {
        const table = chatbot[`data_table_${i}`]
        const canRead = chatbot[`data_table_${i}_read`]
        const canWrite = chatbot[`data_table_${i}_write`]
        const canEdit = chatbot[`data_table_${i}_edit`]
        if (!table) continue

        const db = createClient(owner.supabase_url, owner.supabase_key_encrypted)

        if (canRead) {
          const { data } = await db.from(table).select('*')
          if (data && data.length > 0) {
            dataContext += `
Information regarding ${table}:
${JSON.stringify(data, null, 2)}
`
          } else {
            dataContext += `
Information regarding ${table}: Currently empty.
`
          }
        }

        if (canWrite) {
          const schema = await getTableSchema(owner.supabase_url, owner.supabase_key_encrypted, table)
          if (schema) {
            writeCapabilities += `
- Capability: Record/Update ${table}. 
  Required Fields: ${schema.map(s => s.column_name).join(', ')}
  Action Trigger: When the user confirms saving this info, output EXACTLY: [ADD_DATA]{"tableName":"${table}","data":{...}}
`
          }
        }

        if (canEdit) {
          const schema = await getTableSchema(owner.supabase_url, owner.supabase_key_encrypted, table)
          if (schema) {
            editCapabilities += `
- Capability: Edit existing entries in ${table}.
  Required Fields: id, plus any fields to update from ${schema.map(s => s.column_name).join(', ')}
  Action Trigger: When the user confirms editing an existing entry, output EXACTLY: [EDIT_DATA]{"tableName":"${table}","id":<id>,"data":{...}}
`
          }
        }
      }

      if (dataContext !== "\n### KNOWLEDGE BASE & DATA ACCESS\n") {
        systemPrompt += dataContext
      }

      if (writeCapabilities) {
        systemPrompt += `
### DATA RECORDING PROTOCOL
${writeCapabilities}
IMPORTANT RULES FOR RECORDING DATA:
- Act naturally. Do not say "I am adding this to the database". Say "I've noted that down for you" or "I've saved those details".
- ONLY trigger the [ADD_DATA] command when the user has provided necessary info and confirmed saving.
- IMPORTANT: Output your natural conversational response AND the [ADD_DATA] command in a SINGLE MESSAGE.
- The [ADD_DATA] command MUST be on a NEW LINE at the VERY END of your response.
- Example: "Great! I've noted that down for you.

[ADD_DATA]{...}"
- Ensure the JSON in [ADD_DATA] strictly follows the schema provided.
`
      }

      if (editCapabilities) {
        systemPrompt += `
### DATA EDITING PROTOCOL
${editCapabilities}
IMPORTANT RULES FOR EDITING DATA:
- ONLY use [EDIT_DATA] when the user asks to modify an existing record and confirms the update.
- Always include record id in [EDIT_DATA].
- IMPORTANT: Output your natural conversational response AND the [EDIT_DATA] command in a SINGLE MESSAGE.
- The [EDIT_DATA] command MUST be on a NEW LINE at the VERY END of your response.
- Example: "Done — I updated that for you.

[EDIT_DATA]{"tableName":"table_name","id":123,"data":{...}}"
- Ensure the JSON in [EDIT_DATA] is valid.
`
      }
    }

    /* ───── AI CALL ───── */
    let responseData: any = null

    for (const model of [chatbot.model, ...POPULAR_MODELS]) {
      if (!model) continue

      const res = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${owner.openrouter_key_encrypted}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              ...history,
              ...messages,
            ],
          }),
        }
      )

      if (res.ok) {
        responseData = await res.json()
        break
      }
    }

    if (!responseData) {
      return NextResponse.json(
        { error: 'AI failed' },
        { status: 502, headers: corsHeaders }
      )
    }

    let reply = responseData.choices[0].message.content
    const tokensUsed = responseData.usage?.total_tokens || 0
    let dbWriteOccurred = false

    /* ───── CONFIRMATION GUARD (BACKEND SAFETY) ───── */
    const lastText = lastUserMessage.toLowerCase()
    const isConfirmed =
      lastText.includes('yes') ||
      lastText.includes('confirm') ||
      lastText.includes('save')

    if ((reply.startsWith('[ADD_DATA]') || reply.startsWith('[EDIT_DATA]')) && !isConfirmed) {
      return NextResponse.json(
        { reply: 'Please confirm before saving this information.' },
        { headers: corsHeaders }
      )
    }

    const commandResult = await processDataCommands(reply, owner)
    reply = commandResult.reply
    dbWriteOccurred = commandResult.dbWriteOccurred

    if (reply.includes('[EDIT_DATA]')) {
      try {
        const editMatch = reply.match(/\[EDIT_DATA\]\s*({[\s\S]*})/)
        if (editMatch) {
          const textBefore = reply.substring(0, editMatch.index).trim()
          const payload = JSON.parse(editMatch[1].trim())

          if (!payload.tableName || payload.id === undefined || !payload.data) {
            throw new Error('Invalid EDIT_DATA format')
          }

          const db = createClient(owner.supabase_url, owner.supabase_key_encrypted)
          await db.from(payload.tableName).update(payload.data).eq('id', payload.id)
          dbWriteOccurred = true

          reply = textBefore
            ? `${textBefore}

(I've successfully updated that entry in ${payload.tableName} for you.)`
            : `I've successfully updated that entry in ${payload.tableName} for you.`
        }
      } catch (e) {
        console.error('Error processing EDIT_DATA:', e)
      }
    }

    /* ───── USAGE TRACKING ───── */
    const month = new Date().toISOString().split('T')[0]
    const { data: existing } = await supabaseAdmin
      .from('usage')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .maybeSingle()

    if (existing) {
      await supabaseAdmin
        .from('usage')
        .update({
          messages: existing.messages + 1,
          tokens: existing.tokens + tokensUsed,
          api_calls: existing.api_calls + 1,
          db_writes: dbWriteOccurred
            ? (existing.db_writes || 0) + 1
            : existing.db_writes,
        })
        .eq('id', existing.id)
    } else {
      await supabaseAdmin.from('usage').insert({
        user_id: userId,
        month,
        messages: 1,
        tokens: tokensUsed,
        api_calls: 1,
        db_writes: dbWriteOccurred ? 1 : 0,
      })
    }

    return NextResponse.json({ reply }, { headers: corsHeaders })
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}




async function processDataCommands(reply: string, owner: any) {
  const commandRegex = /\[(ADD_DATA|EDIT_DATA)\]\s*({[\s\S]*?})(?=\s*\[(?:ADD_DATA|EDIT_DATA)\]|\s*$)/g
  const db = createClient(owner.supabase_url, owner.supabase_key_encrypted)
  const confirmations: string[] = []
  let dbWriteOccurred = false

  let match: RegExpExecArray | null
  while ((match = commandRegex.exec(reply)) !== null) {
    const commandType = match[1]
    const payloadRaw = match[2]

    try {
      const payload = JSON.parse(payloadRaw)

      if (commandType === 'ADD_DATA') {
        if (!payload.tableName || !payload.data) {
          throw new Error('Invalid ADD_DATA format')
        }

        await db.from(payload.tableName).insert([payload.data])
        dbWriteOccurred = true
        confirmations.push(`(I've successfully saved those details to ${payload.tableName} for you.)`)
      }

      if (commandType === 'EDIT_DATA') {
        if (!payload.tableName || payload.id === undefined || !payload.data) {
          throw new Error('Invalid EDIT_DATA format')
        }

        await db.from(payload.tableName).update(payload.data).eq('id', payload.id)
        dbWriteOccurred = true
        confirmations.push(`(I've successfully updated that entry in ${payload.tableName} for you.)`)
      }
    } catch (error) {
      console.error(`Error processing ${commandType}:`, error)
    }
  }

  const cleanedReply = reply.replace(commandRegex, '').trim()
  const confirmationText = confirmations.join('\n')

  if (cleanedReply && confirmationText) {
    return { reply: `${cleanedReply}\n\n${confirmationText}`, dbWriteOccurred }
  }

  if (!cleanedReply && confirmationText) {
    return { reply: confirmationText, dbWriteOccurred }
  }

  return { reply: cleanedReply, dbWriteOccurred }
}

async function checkDailyMessageLimit(supabaseAdmin: any, userId: string) {
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabaseAdmin
    .from('usage')
    .select('messages')
    .eq('user_id', userId)
    .eq('month', today)
    .maybeSingle()

  const messagesToday = Number(existing?.messages) || 0
  return messagesToday < MAX_DAILY_MESSAGES
}
