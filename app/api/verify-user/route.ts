
import { createClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

// This endpoint verifies a Heho API key and returns the user's data.
export async function POST(req: Request) {
  try {
    // 1. Extract the API Key from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header is missing or malformed.' }, { status: 401 });
    }
    const apiKey = authHeader.substring(7); // Remove "Bearer " prefix

    // 2. Use the Admin client to bypass RLS and find the user by their key
    const supabaseAdmin = createClient();
    
    // WARNING: Returning all user data, including encrypted keys and sensitive info.
    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('*') 
      .eq('heho_api_key', apiKey)
      .single();

    // 3. Handle errors or an invalid key
    if (findError || !user) {
      return NextResponse.json({ error: 'Invalid API Key.' }, { status: 401 });
    }

    // 4. Return the full user object on success
    return NextResponse.json(user);

  } catch (error: any) {
    console.error("Verify User Error:", error);
    return NextResponse.json({ error: 'An unexpected server error occurred.', details: error.message }, { status: 500 });
  }
}
