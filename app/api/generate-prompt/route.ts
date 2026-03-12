import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const models = [
    "arcee-ai/trinity-large-preview:free",
    "arcee-ai/trinity-mini:free",
    "liquid/lfm-2.5-1.2b-thinking:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "openrouter/hunter-alpha",
];

export async function POST(request: Request) {
  try {
    const { name, goal, description } = await request.json();

    if (!name || !goal) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('openrouter_key_encrypted')
        .eq('id', user.id)
        .single();
    
    if (userError && userError.code !== 'PGRST116') {
        console.error("Supabase error fetching user data:", userError);
        return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
    }

    const openrouterApiKey = userData?.openrouter_key_encrypted;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://heho.app",
        "X-Title": "HeHo",
    };

    if (openrouterApiKey) {
        headers["Authorization"] = `Bearer ${openrouterApiKey}`;
    } else {
        console.warn("User does not have an OpenRouter API key or profile. Using free model without authentication.");
    }

    const promptContent = `You are an expert AI chatbot designer do not add any mock data to prompt. Create a detailed system prompt for a chatbot with the following requirements:\n\nChatbot Name: ${name}\nGoal: ${goal}\nProject Description: ${description || 'Not provided'}\n\nGenerate a comprehensive system prompt (at least 200 characters) that includes:\n1. The chatbot\'s purpose and role.\n2. Key behaviors and capabilities.\n3. Tone and communication style guidelines.\n4. Important limitations and what it should NOT do. Crucially, the chatbot must NEVER mention the name of a database table or any other implementation detail.\n5. How to handle edge cases.\n6. Any specific business rules to follow.\n7. When presenting information in a list, use markdown formatting.\n\nThe prompt should be practical, detailed, and ready to use for training the AI model. Return only the system prompt, no additional text and provide no mock data .`;

    let lastError = null;

    for (const model of models) {
        try {
            const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: "user", content: promptContent }],
                    temperature: 0.7,
                    max_tokens: 1024,
                }),
            });

            if (openRouterResponse.ok) {
                const data = await openRouterResponse.json();
                if (data.choices && data.choices.length > 0) {
                    const prompt = data.choices[0].message.content.trim();
                    return NextResponse.json({ prompt });
                }
            }
            lastError = await openRouterResponse.text();
            console.warn(`Model ${model} failed. Trying next... Error: ${lastError}`);

        } catch (error) {
            lastError = error;
            console.warn(`Model ${model} failed with a network error. Trying next... Error: ${error}`);
        }
    }
    
    console.error("All models failed to generate a prompt. Last error:", lastError);
    return NextResponse.json({ error: "Failed to generate prompt from all available models." }, { status: 500 });

  } catch (error: any) {
    console.error("[v0] Generate prompt internal error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
