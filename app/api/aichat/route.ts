import { createClient as createSupabaseAdminClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

const POPULAR_MODELS = [
  'allenai/olmo-3.1-32b-think:free',
  'xiaomi/mimo-v2-flash:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'mistralai/devstral-2512:free',
  'nex-agi/deepseek-v3.1-nex-n1:free',
  'arcee-ai/trinity-mini:free',
  'tngtech/tng-r1t-chimera:free',
  'kwaipilot/kat-coder-pro:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'alibaba/tongyi-deepresearch-30b-a3b:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'z-ai/glm-4.5-air:free',
  'qwen/qwen3-coder:free',
  'moonshotai/kimi-k2:free',
  'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
  'google/gemma-3n-e2b-it:free',
  'tngtech/deepseek-r1t2-chimera:free',
  'deepseek/deepseek-r1-0528:free',
  'google/gemma-3n-e4b-it:free',
]

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

async function getTableSchema(
  supabaseUrl: string,
  supabaseKey: string,
  tableName: string
): Promise<any[] | null> {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`)
    if (!response.ok) return null

    const openapiSpec = await response.json()
    const definition = openapiSpec.definitions?.[tableName]
    if (!definition?.properties) return null

    return Object.keys(definition.properties)
      .filter(c => !['id', 'created_at'].includes(c))
      .map(c => ({
        column_name: c,
        data_type:
          definition.properties[c].format ||
          definition.properties[c].type,
      }))
  } catch {
    return null
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    /* ───────────── API KEY AUTH ───────────── */
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      )
    }

    const apiKey = authHeader.slice(7)
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

    /* ───────────── REQUEST ───────────── */
    const { message, history, chatbotId } = await request.json()
    if (!message || !chatbotId) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400, headers: corsHeaders }
      )
    }

    const userId = apiUser.id

    /* ───────────── FETCH CHATBOT + OWNER ───────────── */
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
    if (!owner?.openrouter_key_encrypted) {
      return NextResponse.json(
        { error: 'API key missing' },
        { status: 400, headers: corsHeaders }
      )
    }

    /* ───────────── SYSTEM PROMPT ───────────── */
    let systemPrompt = `You are a helpful AI assistant named ${chatbot.name}.`

    if (owner.supabase_url && owner.supabase_key_encrypted) {
      for (let i = 1; i <= 3; i++) {
        const table = chatbot[`data_table_${i}`]
        const canRead = chatbot[`data_table_${i}_read`]
        const canWrite = chatbot[`data_table_${i}_write`]
        if (!table) continue

        const db = createClient(
          owner.supabase_url,
          owner.supabase_key_encrypted
        )

        if (canRead) {
          const { data } = await db.from(table).select('*')
          if (data) {
            systemPrompt += `\n\nCurrent ${table} data:\n${JSON.stringify(
              data,
              null,
              2
            )}`
          }
        }

        if (canWrite) {
          const schema = await getTableSchema(
            owner.supabase_url,
            owner.supabase_key_encrypted,
            table
          )
          if (schema) {
            systemPrompt += `\n\nWhen confirmed, respond ONLY as:\n[ADD_DATA]{"tableName":"${table}","data":{...}}`
            systemPrompt += `\nSchema:\n${JSON.stringify(schema, null, 2)}`
          }
        }
      }
    }

    /* ───────────── AI CALL ───────────── */
    let responseData: any = null

    for (const model of [chatbot.model, ...POPULAR_MODELS]) {
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
              ...(history || []),
              { role: 'user', content: message },
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
        { status: 500, headers: corsHeaders }
      )
    }

    let reply = responseData.choices[0].message.content
    const tokensUsed = responseData.usage?.total_tokens || 0
    let dbWriteOccurred = false

    /* ───────────── INSERT (IDENTICAL LOGIC) ───────────── */
    if (reply.startsWith('[ADD_DATA]')) {
      const { tableName, data } = JSON.parse(reply.slice(10))

      const db = createClient(
        owner.supabase_url,
        owner.supabase_key_encrypted
      )

      await db.from(tableName).insert([data])
      dbWriteOccurred = true
      reply = `Done. Record added to ${tableName}.`
    }

    /* ───────────── USAGE TRACKING ───────────── */
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
  } catch (e: any) {
    console.error(e)
    return NextResponse.json(
      { error: e.message },
      { status: 500, headers: corsHeaders }
    )
  }
}
