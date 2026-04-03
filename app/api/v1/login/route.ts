
import { createClient as createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    
    // We use a temporary client to verify credentials
    const supabaseAuth = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: corsHeaders });
    }

    const userId = authData.user.id;
    const supabaseAdmin = createSupabaseAdminClient();

    // Fetch user details
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('heho_api_key, openrouter_key_encrypted')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404, headers: corsHeaders });
    }

    // Check if OpenRouter key is present
    if (!userData.openrouter_key_encrypted) {
      return NextResponse.json({ error: 'complete setup first' }, { status: 400, headers: corsHeaders });
    }

    let hehoApiKey = userData.heho_api_key;

    // Generate HeHo API key if not present
    if (!hehoApiKey) {
      const randomBytes = crypto.randomBytes(12);
      const apiKeyChars = randomBytes.toString('hex');
      hehoApiKey = `heho_${apiKeyChars}`;

      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ heho_api_key: hehoApiKey })
        .eq('id', userId);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to generate HeHo API key' }, { status: 500, headers: corsHeaders });
      }
    }

    return NextResponse.json({ heho_api_key: hehoApiKey }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('Login API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
