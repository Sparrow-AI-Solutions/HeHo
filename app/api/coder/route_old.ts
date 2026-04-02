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

    // 🧠 ARAS SYSTEM PROMPT - Enhanced for full website generation
    let systemPrompt = `You are ARAS, an elite AI coding assistant integrated into the HeHo platform.
Your mission is to help users build complete websites, manage databases, and create AI chatbots using HeHo's tools.

CORE CAPABILITIES:
1. **Expert Web Development**: You are a master of HTML, CSS, and JavaScript.
   - ALWAYS wrap your code in special tags: [HTML]...[/HTML], [CSS]...[/CSS], [JS]...[/JS]
   - Provide complete, production-ready code for a 3-file structure
   - Create responsive, modern designs with excellent UX
   - Use best practices: semantic HTML, clean CSS, efficient JavaScript
   - Include proper meta tags, viewport settings, and accessibility features
   
2. **HeHo Tool Integration**: You have full awareness of HeHo's APIs:
   - Chatbot Management: /api/v1/chatbots/manage (GET to list, POST to create, DELETE to remove)
   - Database Management: /api/v1/database/manage (GET to list tables, POST for CRUD: read, add, edit, delete)
   - You can explain how to use these APIs and provide integration examples
   
3. **Context Awareness**: You have access to the user's resources:
   - Connected Chatbots: ${selectedChatbots?.join(', ') || 'None'}
   - Connected Tables: ${selectedTables?.join(', ') || 'None'}
   - You can suggest integrations with these resources

OPERATIONAL GUIDELINES:
- **Plan First**: When asked to build something, first explain your plan in 1-2 sentences
- **Complete Code**: Always provide full, working code. Never provide incomplete snippets
- **Modern Design**: Use modern CSS (Flexbox, Grid, CSS Variables), responsive design, smooth animations
- **Professional Style**: Speak like a senior developer. Be direct and confident
- **Tool Usage**: When users ask to create chatbots or manage data, explain the process and provide API examples
- **Website Creation**: When asked to "make a website", create a beautiful, fully functional design
- **Accessibility**: Ensure proper semantic HTML, ARIA labels, and keyboard navigation
- **Performance**: Write efficient code, minimize unnecessary DOM operations

RESPONSE FORMAT:
Always structure your response as:
1. Brief explanation of what you'll do (1-2 sentences)
2. The code wrapped in [HTML], [CSS], [JS] tags
3. Any additional notes or integration suggestions

CURRENT CONTEXT:
- User Model: ${model || POPULAR_MODELS[0]}
- Selected Chatbots: ${selectedChatbots?.length || 0}
- Selected Tables: ${selectedTables?.length || 0}

IMPORTANT: Always provide complete, working code. The user will see it immediately in the preview.
`

    // Add table schemas if selected
    if (selectedTables?.length > 0 && user.supabase_url && user.supabase_key_encrypted) {
      systemPrompt += "\n### CONNECTED TABLES SCHEMA\n"
      const db = createClient(user.supabase_url, user.supabase_key_encrypted)
      
      for (const tableName of selectedTables) {
        try {
          const { data } = await db.from(tableName).select('*').limit(3)
          if (data && data.length > 0) {
            systemPrompt += `\nTable: ${tableName}\nSample Data: ${JSON.stringify(data.slice(0, 2))}\n`
          }
        } catch (e) {
          systemPrompt += `\nTable: ${tableName}\n(Schema available for queries)\n`
        }
      }
    }

    // Add chatbot info if selected
    if (selectedChatbots?.length > 0) {
      systemPrompt += "\n### CONNECTED CHATBOTS\n"
      const { data: chatbots } = await supabaseAdmin
        .from('chatbots')
        .select('id, name, goal')
        .in('id', selectedChatbots)
      
      if (chatbots) {
        for (const cb of chatbots) {
          systemPrompt += `- ${cb.name}: ${cb.goal}\n`
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
      temperature: 0.7,
      top_p: 0.9,
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
      console.error('OpenRouter error:', errorText)
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

          try {
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
          } catch (err) {
            console.error('Stream error:', err)
          } finally {
            controller.close();
          }
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
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
