
import { createClient as createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

const POPULAR_MODELS = [
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-7b-it:free',
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

export async function POST(req: Request) {
  try {
    // 1. Authenticate with API Key
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(JSON.stringify({ error: 'Authorization header is missing or malformed.' }), { status: 401, headers: corsHeaders });
    }
    const apiKey = authHeader.substring(7);
    const supabaseAdmin = createSupabaseAdminClient();
    const { data: apiUser, error: userError } = await supabaseAdmin.from('users').select('id').eq('heho_api_key', apiKey).single();
    if (userError || !apiUser) {
      return new NextResponse(JSON.stringify({ error: 'Invalid API Key.' }), { status: 401, headers: corsHeaders });
    }

    const userId = apiUser.id;
    const { chatbotId, messages, history } = await req.json();
    if (!chatbotId || !messages || !Array.isArray(messages)) {
      return new NextResponse(JSON.stringify({ error: 'A valid chatbotId and a messages array are required.' }), { status: 400, headers: corsHeaders });
    }

    // 2. Fetch Chatbot and Owner Data, ensuring ownership
    const { data: chatbot } = await supabaseAdmin.from('chatbots').select('*, users (*)').eq('id', chatbotId).eq('user_id', userId).single();
    if (!chatbot) {
      return new NextResponse(JSON.stringify({ error: 'Chatbot not found or you do not have access.' }), { status: 404, headers: corsHeaders });
    }

    const owner = chatbot.users;
    if (!owner?.openrouter_key_encrypted) {
      return new NextResponse(JSON.stringify({ error: 'The chatbot owner has not configured their OpenRouter API key.' }), { status: 400, headers: corsHeaders });
    }

    // 3. Build System Prompt (with DB integration)
    let systemPrompt = `You are a helpful AI assistant named ${chatbot.name}.`;
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
          if (data) systemPrompt += `\n\nCurrent ${table} data:\n${JSON.stringify(data, null, 2)}`;
        }
        if (canWrite) {
          const schema = await getTableSchema(owner.supabase_url, owner.supabase_key_encrypted, table);
          if (schema) {
            systemPrompt += `\n\nWhen confirmed, respond ONLY as:\n[ADD_DATA]{\"tableName\":\"${table}\",\"data\":{...}}`;
            systemPrompt += `\nSchema:\n${JSON.stringify(schema, null, 2)}`;
          }
        }
      }
    }

    // 4. Call AI Service
    let responseData: any = null;
    for (const model of [chatbot.model, ...POPULAR_MODELS]) {
        if (!model) continue;
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${owner.openrouter_key_encrypted}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, ...(history || []), ...messages] })
        });
        if (res.ok) {
            responseData = await res.json();
            break;
        }
    }
    if (!responseData) return new NextResponse(JSON.stringify({ error: 'The AI service failed to respond.' }), { status: 502, headers: corsHeaders });

    let reply = responseData.choices[0].message.content;
    const tokensUsed = responseData.usage?.total_tokens || 0;
    let dbWriteOccurred = false;

    // 5. Handle DB Write
    if (reply.startsWith('[ADD_DATA]')) {
      const { tableName, data } = JSON.parse(reply.slice(10));
      const db = createClient(owner.supabase_url, owner.supabase_key_encrypted);
      await db.from(tableName).insert([data]);
      dbWriteOccurred = true;
      reply = `Done. Record added to ${tableName}.`;
    }

    // 6. Track Usage
    const month = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabaseAdmin.from('usage').select('*').eq('user_id', userId).eq('month', month).maybeSingle();
    if (existing) {
      await supabaseAdmin.from('usage').update({ messages: existing.messages + 1, tokens: existing.tokens + tokensUsed, api_calls: existing.api_calls + 1, db_writes: dbWriteOccurred ? (existing.db_writes || 0) + 1 : existing.db_writes }).eq('id', existing.id);
    } else {
      await supabaseAdmin.from('usage').insert({ user_id: userId, month, messages: 1, tokens: tokensUsed, api_calls: 1, db_writes: dbWriteOccurred ? 1 : 0 });
    }

    // 7. Return Reply
    return new NextResponse(JSON.stringify({ reply }), { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error("AI Chat API Error:", error);
    return new NextResponse(JSON.stringify({ error: 'An unexpected server error occurred.' }), { status: 500, headers: corsHeaders });
  }
}
