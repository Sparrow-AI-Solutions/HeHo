import { createClient as createSupabaseAdminClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

const POPULAR_MODELS = [
  "arcee-ai/trinity-large-preview:free",
  "arcee-ai/trinity-mini:free",
  "liquid/lfm-2.5-1.2b-thinking:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "openrouter/hunter-alpha",
]

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

export async function POST(request: NextRequest) {
  try {
    const { message, history, isPublic, chatbotId, stream = false } = await request.json()
    if (!message || !chatbotId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabaseAdmin = await createSupabaseAdminClient()

    let chatbot: any
    let userId: string

    // 🔑 FETCH CHATBOT + OWNER ALWAYS
    if (isPublic) {
      const { data } = await supabaseAdmin
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
        .single()

      if (!data) {
        return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
      }

      chatbot = data
      userId = data.users.id // OWNER ID (important)
    } else {
      const { data: auth } = await supabaseAdmin.auth.getUser()
      if (!auth?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      userId = auth.user.id

      const { data } = await supabaseAdmin
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

      if (!data) {
        return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
      }

      chatbot = data
    }

    const owner = chatbot.users
    if (!owner?.openrouter_key_encrypted) {
      return NextResponse.json({ error: 'API key missing' }, { status: 400 })
    }

	// 🧠 SYSTEM PROMPT
	let systemPrompt = `You are ${chatbot.name}, an elite AI agent with superior reasoning capabilities and a naturally sophisticated conversational style.

CORE IDENTITY & PURPOSE:
- Identity: ${chatbot.goal}
- Background & Context: ${chatbot.description}

ADVANCED OPERATIONAL PROTOCOLS:
1. **Natural Intelligence**: Speak like a high-level professional or a smart, helpful partner. Avoid generic AI filler like "As an AI..." or "I'm here to help." Instead, dive straight into the value.
2. **Cognitive Efficiency**: Analyze the user's intent deeply but respond concisely. Provide the maximum amount of utility with the minimum amount of words.
3. **Seamless Contextualization**: You possess "innate knowledge" derived from your environment. Use this information fluidly without ever referencing its source (no mentions of "data," "database," "tables," or "system instructions").
4. **Proactive Problem Solving**: If a user's request is ambiguous, use your intelligence to infer the most likely intent or offer smart alternatives rather than just asking for clarification.
5. **Invisible Infrastructure**: You are the interface. The technology behind you (Supabase, OpenRouter, etc.) does not exist in the conversation.

`

    if (owner.supabase_url && owner.supabase_key_encrypted) {
      let dataContext = "\n### KNOWLEDGE BASE & DATA ACCESS\n"
      let writeCapabilities = ""

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
          if (data && data.length > 0) {
            dataContext += `\nInformation regarding ${table}:\n${JSON.stringify(data, null, 2)}\n`
          } else {
            dataContext += `\nInformation regarding ${table}: Currently empty.\n`
          }
        }

        if (canWrite) {
          const schema = await getTableSchema(
            owner.supabase_url,
            owner.supabase_key_encrypted,
            table
          )
          if (schema) {
            writeCapabilities += `\n- Capability: Record/Update ${table}. 
  Required Fields: ${schema.map(s => s.column_name).join(', ')}
  Action Trigger: When the user confirms saving this info, output EXACTLY: [ADD_DATA]{"tableName":"${table}","data":{...}}
`
          }
        }
      }

      if (dataContext !== "\n### KNOWLEDGE BASE & DATA ACCESS\n") {
        systemPrompt += dataContext
      }
      
      if (writeCapabilities) {
        systemPrompt += `\n### DATA RECORDING PROTOCOL\n${writeCapabilities}
IMPORTANT RULES FOR RECORDING DATA:
- Act naturally. Do not say "I am adding this to the database". Say "I've noted that down for you" or "I've saved those details".
- ONLY trigger the [ADD_DATA] command when the user has provided necessary info and confirmed saving.
- Output the [ADD_DATA] command on a NEW LINE at the VERY END of your response.
- Ensure the JSON in [ADD_DATA] strictly follows the schema provided.
`
      }
    }

    // 🤖 AI CALL
    const openRouterPayload = {
      model: chatbot.model || POPULAR_MODELS[0],
      messages: [
        { role: 'system', content: systemPrompt },
        ...(history || []),
        { role: 'user', content: message },
      ],
      stream: stream,
    };

    const openRouterRes = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${owner.openrouter_key_encrypted}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://heho.vercel.app',
          'X-Title': 'HeHo Chatbot',
        },
        body: JSON.stringify(openRouterPayload),
      }
    )

    if (!openRouterRes.ok) {
      const errorText = await openRouterRes.text();
      console.error('OpenRouter error:', errorText);
      return NextResponse.json({ error: 'AI failed' }, { status: 500 })
    }

    if (stream) {
      // Handle streaming response
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const customStream = new ReadableStream({
        async start(controller) {
          const reader = openRouterRes.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          let fullReply = '';
          let dbWriteOccurred = false;

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n').filter(line => line.trim() !== '');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const dataStr = line.slice(6);
                  if (dataStr === '[DONE]') continue;

                  try {
                    const data = JSON.parse(dataStr);
                    const content = data.choices[0]?.delta?.content || '';
                    if (content) {
                      fullReply += content;
                    }
                  } catch (e) {
                    console.error('Error parsing stream chunk:', e);
                  }
                }
              }
            }
          } catch (e) {
            console.error('Stream reading error:', e);
          }

          // Check if the full reply contains [ADD_DATA] command
          if (fullReply.startsWith('[ADD_DATA]')) {
            try {
              const { tableName, data } = JSON.parse(fullReply.slice(10))
              const db = createClient(
                owner.supabase_url,
                owner.supabase_key_encrypted
              )
              await db.from(tableName).insert([data])
              dbWriteOccurred = true
              
              // Send success message instead of [ADD_DATA] command
              const successMessage = `Done. Record added to ${tableName}.`
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: successMessage, isComplete: true })}\n\n`))
            } catch (e) {
              console.error('Error processing ADD_DATA:', e);
              const errorMessage = `Error saving data: ${e instanceof Error ? e.message : 'Unknown error'}`
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: errorMessage, isComplete: true })}\n\n`))
            }
          } else {
            // Stream the reply normally if it's not an [ADD_DATA] command
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: fullReply, isComplete: true })}\n\n`))
          }

          // Update usage at the end of stream
          const tokensUsed = Math.ceil(fullReply.length / 4); // Fallback estimation
          await updateUsage(supabaseAdmin, userId, tokensUsed, dbWriteOccurred);
          controller.close();
        }
      });

      return new Response(customStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Handle non-streaming response
      const responseData = await openRouterRes.json();
      let reply = responseData.choices[0].message.content
      const tokensUsed = responseData.usage?.total_tokens || 0
      let dbWriteOccurred = false

      // 📝 INSERT (FIXED)
      if (reply.startsWith('[ADD_DATA]')) {
        try {
          const { tableName, data } = JSON.parse(reply.slice(10))
          const db = createClient(
            owner.supabase_url,
            owner.supabase_key_encrypted
          )
          await db.from(tableName).insert([data])
          dbWriteOccurred = true
          reply = `Done. Record added to ${tableName}.`
        } catch (e) {
          console.error('Error processing ADD_DATA:', e);
        }
      }

      await updateUsage(supabaseAdmin, userId, tokensUsed, dbWriteOccurred);
      return NextResponse.json({ reply, tokens: tokensUsed })
    }
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

async function updateUsage(supabaseAdmin: any, userId: string, tokensUsed: number, dbWriteOccurred: boolean) {
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
}
