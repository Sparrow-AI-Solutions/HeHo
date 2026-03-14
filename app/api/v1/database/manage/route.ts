
import { createClient as createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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

async function getTableSchema(supabaseUrl: string, supabaseKey: string, tableName: string) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
    if (!res.ok) return null;

    const spec = await res.json();
    const def = spec.definitions?.[tableName];
    if (!def?.properties) return null;

    return Object.keys(def.properties).map(c => ({
      column_name: c,
      data_type: def.properties[c].format || def.properties[c].type,
      required: def.required?.includes(c) || false
    }));
  } catch (error) {
    console.error(`Error fetching schema for ${tableName}:`, error);
    return null;
  }
}

// GET /api/v1/database/manage - Fetch all connected tables and their columns
export async function GET(req: Request) {
  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  if (!user.supabase_url || !user.supabase_key_encrypted) {
    return NextResponse.json({ error: 'Supabase connection not configured in settings.' }, { status: 400, headers: corsHeaders });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: connectedTables, error } = await supabaseAdmin
    .from('user_connected_tables')
    .select('table_name')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch connected tables', details: error.message }, { status: 500, headers: corsHeaders });
  }

  const defaultTables = ['products', 'leads', 'customer_queries', 'sales'];
  const allTableNames = Array.from(new Set([...defaultTables, ...(connectedTables?.map(t => t.table_name) || [])]));

  const tablesWithColumns = await Promise.all(allTableNames.map(async (tableName) => {
    const columns = await getTableSchema(user.supabase_url!, user.supabase_key_encrypted!, tableName);
    return {
      table_name: tableName,
      columns: columns || []
    };
  }));

  return NextResponse.json({ tables: tablesWithColumns }, { status: 200, headers: corsHeaders });
}

// POST /api/v1/database/manage - CRUD operations on table rows
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
    const { action, tableName, data, query, id } = body;

    if (!tableName) {
      return NextResponse.json({ error: 'tableName is required' }, { status: 400, headers: corsHeaders });
    }

    const userSupabase = createClient(user.supabase_url, user.supabase_key_encrypted);

    switch (action) {
      case 'read':
        let readQuery = userSupabase.from(tableName).select('*');
        if (query) {
            // Basic filtering if provided, e.g., { "id": 1 }
            for (const [key, value] of Object.entries(query)) {
                readQuery = readQuery.eq(key, value);
            }
        }
        const { data: readData, error: readError } = await readQuery.limit(100);
        if (readError) throw readError;
        return NextResponse.json({ data: readData }, { status: 200, headers: corsHeaders });

      case 'add':
        if (!data) return NextResponse.json({ error: 'data is required for add action' }, { status: 400, headers: corsHeaders });
        const { data: addData, error: addError } = await userSupabase.from(tableName).insert(data).select().single();
        if (addError) throw addError;
        return NextResponse.json({ message: 'Row added successfully', data: addData }, { status: 201, headers: corsHeaders });

      case 'edit':
        if (!id || !data) return NextResponse.json({ error: 'id and data are required for edit action' }, { status: 400, headers: corsHeaders });
        const { data: editData, error: editError } = await userSupabase.from(tableName).update(data).eq('id', id).select().single();
        if (editError) throw editError;
        return NextResponse.json({ message: 'Row updated successfully', data: editData }, { status: 200, headers: corsHeaders });

      case 'delete':
        if (!id) return NextResponse.json({ error: 'id is required for delete action' }, { status: 400, headers: corsHeaders });
        const { error: deleteError } = await userSupabase.from(tableName).delete().eq('id', id);
        if (deleteError) throw deleteError;
        return NextResponse.json({ message: 'Row deleted successfully' }, { status: 200, headers: corsHeaders });

      default:
        return NextResponse.json({ error: 'Invalid action. Supported actions: read, add, edit, delete' }, { status: 400, headers: corsHeaders });
    }

  } catch (error: any) {
    console.error('Database API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
