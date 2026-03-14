import { createClient as createSupabaseAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

async function authenticate(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const apiKey = authHeader.substring(7);
  const supabaseAdmin = createSupabaseAdminClient();
  
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, supabase_url, supabase_key_encrypted')
    .eq('heho_api_key', apiKey)
    .single();

  if (error || !user) {
    return null;
  }
  return user;
}

// POST /api/v1/database/tables/connect - Connect an existing table
export async function POST(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  if (!user.supabase_url || !user.supabase_key_encrypted) {
    return NextResponse.json({ error: 'Supabase connection not configured in settings.' }, { status: 400, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { tableName } = body;

    if (!tableName) {
      return NextResponse.json({ error: 'tableName is required' }, { status: 400, headers: corsHeaders });
    }

    // Validate table name
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return NextResponse.json({ error: 'Invalid table name. Use only letters, numbers, and underscores.' }, { status: 400, headers: corsHeaders });
    }

    const supabaseAdmin = createSupabaseAdminClient();

    // Check if table already connected
    const { data: existingTable } = await supabaseAdmin
      .from('user_connected_tables')
      .select('id')
      .eq('user_id', user.id)
      .eq('table_name', tableName)
      .single();

    if (existingTable) {
      return NextResponse.json({ error: 'Table is already connected' }, { status: 409, headers: corsHeaders });
    }

    // Add table to user_connected_tables
    const { data: connectedTable, error: insertError } = await supabaseAdmin
      .from('user_connected_tables')
      .insert({ user_id: user.id, table_name: tableName })
      .select()
      .single();

    if (insertError) {
      console.error('Error connecting table:', insertError);
      return NextResponse.json({ error: `Failed to connect table: ${insertError.message}` }, { status: 500, headers: corsHeaders });
    }

    console.log(`User ${user.id} connected table: ${tableName}`);

    return NextResponse.json({ 
      message: 'Table connected successfully', 
      tableName: tableName,
      table: connectedTable
    }, { status: 201, headers: corsHeaders });

  } catch (error: any) {
    console.error('Unhandled error in POST /api/v1/database/tables/connect:', error);
    return NextResponse.json({ error: `An unexpected error occurred: ${error.message}` }, { status: 500, headers: corsHeaders });
  }
}
