import { createClient as createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { executeSupabaseQuery } from '@/lib/supabase/management-api';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
    .select('id, supabase_url, supabase_key_encrypted, provider_token, refresh_token')
    .eq('heho_api_key', apiKey)
    .single();

  if (error || !user) {
    return null;
  }
  return user;
}

// POST /api/v1/database/tables - Create a new table
export async function POST(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  if (!user.supabase_url) {
    return NextResponse.json({ error: 'Supabase connection not configured in settings.' }, { status: 400, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { tableName, columns } = body;

    if (!tableName || !columns || !Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json({ error: 'Table name and columns are required' }, { status: 400, headers: corsHeaders });
    }

    // Validate table name
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return NextResponse.json({ error: 'Invalid table name. Use only letters, numbers, and underscores.' }, { status: 400, headers: corsHeaders });
    }

    // Construct SQL query for table creation
    const columnDefs = columns.map((col: any) => {
      let def = `${col.name} ${col.type}`;
      if (col.primaryKey) def += ' PRIMARY KEY';
      if (col.notNull) def += ' NOT NULL';
      if (col.defaultValue && col.defaultValue.trim()) {
        def += ` DEFAULT ${col.defaultValue}`;
      }
      return def;
    }).join(', ');

    const sqlQuery = `CREATE TABLE IF NOT EXISTS public.${tableName} (${columnDefs});`;

    console.log(`User ${user.id} executing CREATE TABLE for ${tableName}`);

    // Get the server-side supabase client for token management
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const result = await executeSupabaseQuery(supabase, user.id, sqlQuery);

    if (result.error) {
      console.error(`Query failed for user ${user.id}:`, result.error);
      return NextResponse.json({ error: result.error }, { status: result.status, headers: corsHeaders });
    }

    // If table created successfully, add it to user_connected_tables
    const supabaseAdmin = createSupabaseAdminClient();
    const { error: insertError } = await supabaseAdmin
      .from('user_connected_tables')
      .insert({ user_id: user.id, table_name: tableName });

    if (insertError && insertError.code !== '23505') {
      console.error('Error adding created table to user_connected_tables:', insertError);
    }

    return NextResponse.json({ 
      message: 'Table created successfully', 
      tableName: tableName,
      result: result.data 
    }, { status: 201, headers: corsHeaders });

  } catch (error: any) {
    console.error('Unhandled error in /api/v1/database/tables:', error);
    return NextResponse.json({ error: `An unexpected error occurred: ${error.message}` }, { status: 500, headers: corsHeaders });
  }
}

// DELETE /api/v1/database/tables - Disconnect a table from HeHo (only removes from app, not from Supabase)
export async function DELETE(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
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

    // Only remove from user_connected_tables - does NOT delete the table from Supabase
    const supabaseAdmin = createSupabaseAdminClient();
    const { error: deleteError } = await supabaseAdmin
      .from('user_connected_tables')
      .delete()
      .eq('user_id', user.id)
      .eq('table_name', tableName);

    if (deleteError) {
      console.error('Error removing table from user_connected_tables:', deleteError);
      return NextResponse.json({ error: `Failed to disconnect table: ${deleteError.message}` }, { status: 500, headers: corsHeaders });
    }

    console.log(`User ${user.id} disconnected table: ${tableName}`);

    return NextResponse.json({ 
      message: 'Table disconnected from HeHo successfully. Your table remains in Supabase.', 
      tableName: tableName 
    }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('Unhandled error in DELETE /api/v1/database/tables:', error);
    return NextResponse.json({ error: `An unexpected error occurred: ${error.message}` }, { status: 500, headers: corsHeaders });
  }
}
