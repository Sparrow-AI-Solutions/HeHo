import { createClient as createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from "next/server"; // Changed Request to NextRequest

const POPULAR_MODELS = [
  'allenai/olmo-3.1-32b-think:free', // Updated to match the `app/api/chat/route.ts` list
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
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function getTableSchema(supabaseUrl: string, supabaseKey: string, tableName: string): Promise<any[] | null> {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
    if (!response.ok) return null;

    const openapiSpec = await response.json();
    const definition = openapiSpec.definitions?.[tableName];
    if (!definition?.properties) return null;

    return Object.keys(definition.properties)
      .filter(c => !['id', 'created_at'].includes(c))
      .map(c => ({ column_name: c, data_type: definition.properties[c].format || definition.properties[c].type }));
  } catch { return null; }
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(request: NextRequest) { // Changed req to request and type to NextRequest
  try {
    // API Key Authentication (retained from aichat)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(JSON.stringify({ error: 'Authorization header is missing or malformed.' }), { status: 401, headers: corsHeaders });
    }
    const apiKey = authHeader.substring(7);
    const supabaseAdmin = createSupabaseAdminClient();
    const { data: apiUser, error: userError } = await supabaseAdmin.from('users').select('id').eq('heho_api_key', apiKey).single();
    if (userError || !apiUser) {
      return new NextResponse(JSON.stringify({ error: 'Invalid API Key.' }), { status: 401, headers: corsHeaders });
    }

    const userId = apiUser.id; // User ID from API key authentication

    // Parse request body (changed to match chat/route.ts destructuring and variables)
    const { message, history, isPublic, chatbotId } = await request.json();
    if (!message || !chatbotId) {
      return new NextResponse(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers: corsHeaders });
    }

    let chatbot: any;

    // FETCH CHATBOT + OWNER LOGIC (adapted from chat/route.ts, using userId from API key auth)
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
        .single();

      if (!data) {
        return new NextResponse(JSON.stringify({ error: 'Chatbot not found' }), { status: 404, headers: corsHeaders });
      }
      chatbot = data;
      // Note: For isPublic, the chatbot owner is determined by the chatbot's `user_id` relation,
      // not necessarily the `apiUser.id` which authenticated the request.
      // We will use `chatbot.users.id` for the owner's ID and `apiUser.id` for tracking usage.
      // The `userId` variable is already set to `apiUser.id`.
    } else {
      // In the non-public case, the chatbot must belong to the user making the API call.
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
        .eq('user_id', userId) // Ensure chatbot belongs to the authenticated user
        .single();

      if (!data) {
        return new NextResponse(JSON.stringify({ error: 'Chatbot not found or unauthorized access' }), { status: 404, headers: corsHeaders });
      }
      chatbot = data;
    }

    const owner = chatbot.users;
    if (!owner?.openrouter_key_encrypted) {
      return new NextResponse(JSON.stringify({ error: 'API key missing' }), { status: 400, headers: corsHeaders });
    }

    // SYSTEM PROMPT
    let systemPrompt = `You are a helpful AI assistant named ${chatbot.name}.`;
    // Add description and instructions if available, consistent with previous aichat version
    if (chatbot.description) systemPrompt += ` ${chatbot.description}`;
    if (chatbot.instructions) systemPrompt += `\n\nINSTRUCTIONS:\n${chatbot.instructions}`;


    if (owner.supabase_url && owner.supabase_key_encrypted) {
      for (let i = 1; i <= 3; i++) {
        const table = chatbot[`data_table_${i}`];
        const canRead = chatbot[`data_table_${i}_read`];
        const canWrite = chatbot[`data_table_${i}_write`];
        if (!table) continue;

        const db = createClient(owner.supabase_url, owner.supabase_key_encrypted);

        if (canRead) {
          const { data } = await db.from(table).select('*');
          if (data) {
            systemPrompt += `\n\nCurrent ${table} data:\n${JSON.stringify(data, null, 2)}`;
          }
        }

        if (canWrite) {
          const schema = await getTableSchema(
            owner.supabase_url,
            owner.supabase_key_encrypted,
            table
          );
          if (schema) {
            systemPrompt += `\n\nWhen confirmed, respond ONLY as:\n[ADD_DATA]{"tableName":"${table}","data":{...}}`;
            systemPrompt += `\nSchema:\n${JSON.stringify(schema, null, 2)}`;
          }
        }
      }
    }

    // AI CALL
    let responseData: any = null;
    for (const model of [chatbot.model, ...POPULAR_MODELS]) {
      if (!model) continue; // Added check for model existence, good practice
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
      );

      if (res.ok) {
        responseData = await res.json();
        break;
      }
    }

    if (!responseData) {
      return new NextResponse(JSON.stringify({ error: 'AI failed' }), { status: 500, headers: corsHeaders }); // Used existing error message and added corsHeaders
    }

    let reply = responseData.choices[0].message.content;
    const tokensUsed = responseData.usage?.total_tokens || 0;
    let dbWriteOccurred = false;

    // INSERT (FIXED) - Retained the more robust regex matching from aichat for ADD_DATA
    const addDataRegex = /^\[ADD_DATA\](.*?)(?=\s|$)/s;
    const match = reply.match(addDataRegex);

    if (match && match[1]) {
      try {
        const { tableName, data } = JSON.parse(match[1]);
        const db = createClient(owner.supabase_url, owner.supabase_key_encrypted);
        await db.from(tableName).insert([data]);
        dbWriteOccurred = true;
        // The original chat/route.ts replaced the whole reply, but aichat's version only removes the tag.
        // To align with chat/route.ts's simplified reply, we'll replace the whole reply here.
        reply = `Done. Record added to ${tableName}.`;
      } catch (e) {
        console.error("Failed to parse or insert data:", e);
        // If parsing or insertion fails, we let the AI's original response pass through,
        // which is a reasonable fallback for debugging.
      }
    }

    // USAGE (UNCHANGED)
    const month = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabaseAdmin
      .from('usage')
      .select('*')
      .eq('user_id', userId) // Use the userId from API key auth
      .eq('month', month)
      .maybeSingle();

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
        .eq('id', existing.id);
    } else {
      await supabaseAdmin.from('usage').insert({
        user_id: userId, // Use the userId from API key auth
        month,
        messages: 1,
        tokens: tokensUsed,
        api_calls: 1,
        db_writes: dbWriteOccurred ? 1 : 0,
      });
    }

    return new NextResponse(JSON.stringify({ reply }), { status: 200, headers: corsHeaders });
  } catch (e: any) {
    console.error("AI Chat API Error:", e); // Consistent error logging
    return new NextResponse(JSON.stringify({ error: e.message || 'An unexpected server error occurred.' }), { status: 500, headers: corsHeaders });
  }
}
