
import { createClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

// Common headers for CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allows any origin
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allows these methods
  'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Allows these headers
};

// This function handles the preflight OPTIONS request.
export async function OPTIONS(req: Request) {
  return new NextResponse(null, { headers: corsHeaders });
}

// This endpoint verifies a Heho API key and returns the user's data.
export async function POST(req: Request) {
  try {
    // 1. Extract the API Key from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(JSON.stringify({ error: 'Authorization header is missing or malformed.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    const apiKey = authHeader.substring(7); // Remove "Bearer " prefix

    // 2. Use the Admin client to bypass RLS and find the user by their key
    const supabaseAdmin = createClient();
    
    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('*') 
      .eq('heho_api_key', apiKey) 
      .single();

    // 3. Handle errors or an invalid key
    if (findError || !user) {
      return new NextResponse(JSON.stringify({ error: 'Invalid API Key.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 4. Return the full user object on success
    return new NextResponse(JSON.stringify(user), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Verify User Error:", error);
    return new NextResponse(JSON.stringify({ error: 'An unexpected server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
