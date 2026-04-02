import { createClient as createSupabaseAdminClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

const POPULAR_MODELS = [
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "arcee-ai/trinity-large-preview:free",
  "liquid/lfm-2.5-1.2b-thinking:free",
  "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "openrouter/hunter-alpha",
]

export async function POST(request: NextRequest) {
  try {
    const { message, history, model, selectedChatbots, selectedTables, stream = false } = await request.json()
    
    const supabaseAdmin = await createSupabaseAdminClient()
    const { data: { user: authUser } } = await supabaseAdmin.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (!user?.openrouter_key_encrypted) {
      return NextResponse.json({ error: 'OpenRouter API key missing. Please add it in Settings.' }, { status: 400 })
    }

    // 🧠 ARAS SYSTEM PROMPT
    let systemPrompt = `You are ARAS, an elite AI coding assistant integrated into the HeHo platform.
Your mission is to help users build websites, manage databases, and create AI chatbots using HeHo's tools.

CORE CAPABILITIES:
1. **Web Development**: You can write high-quality HTML, CSS, and JavaScript. 
   - ALWAYS wrap your code in special tags: [HTML]...[/HTML], [CSS]...[/CSS], [JS]...[/JS].
   - Provide complete, functional code for a 3-file structure.
2. **HeHo Tool Integration**: You are aware of HeHo's APIs:
   - Chatbot Management: /api/v1/chatbots/manage (GET to list, POST to create, DELETE to remove)
   - Database Management: /api/v1/database/manage (GET to list tables, POST for CRUD: read, add, edit, delete)
3. **Context Awareness**: You have access to the user's connected chatbots and tables.
   - Connected Chatbots: ${selectedChatbots?.join(', ') || 'None'}
   - Connected Tables: ${selectedTables?.join(', ') || 'None'}

OPERATIONAL GUIDELINES:
- **Plan & Execute**: When asked to build something, first explain your plan, then provide the code or tool commands.
- **Sophisticated Style**: Speak professionally and intelligently. Avoid "As an AI...".
- **Tool Usage**: If the user asks to "make a new chatbot" or "add a table entry", explain that you are performing the action and output the corresponding API command if needed (simulated for now).
- **Website Creation**: When asked to "make a website", focus on creating a beautiful, responsive design using modern CSS and clean JS.

CURRENT CONTEXT:
User is using the model: ${model || POPULAR_MODELS[0]}
`

    // Add table schemas if selected
    if (selectedTables?.length > 0 && user.supabase_url && user.supabase_key_encrypted) {
      systemPrompt += "\n### CONNECTED TABLES DATA\n"
      const db = createClient(user.supabase_url, user.supabase_key_encrypted)
      
      for (const tableName of selectedTables) {
        const { data } = await db.from(tableName).select('*').limit(5)
        if (data) {
          systemPrompt += `Table: ${tableName}\nSample Data: ${JSON.stringify(data)}\n\n`
        }
      }
    }

    const openRouterPayload = {
      model: model || POPULAR_MODELS[0],
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
          Authorization: `Bearer ${user.openrouter_key_encrypted}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://heho.vercel.app',
          'X-Title': 'HeHo Coder ARAS',
        },
        body: JSON.stringify(openRouterPayload),
      }
    )

    if (!openRouterRes.ok) {
      const errorText = await openRouterRes.text();
      return NextResponse.json({ error: 'AI failed: ' + errorText }, { status: 500 })
    }

    if (stream) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const customStream = new ReadableStream({
        async start(controller) {
          const reader = openRouterRes.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const dataStr = line.slice(6);
                if (dataStr === "[DONE]") continue;
                try {
                  const data = JSON.parse(dataStr);
                  const content = data.choices[0]?.delta?.content || "";
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch (e) {}
              }
            }
          }
          controller.close();
        },
      });

      return new Response(customStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      const data = await openRouterRes.json();
      return NextResponse.json({ reply: data.choices[0].message.content });
    }
  } catch (err: any) {
    console.error('Coder API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
