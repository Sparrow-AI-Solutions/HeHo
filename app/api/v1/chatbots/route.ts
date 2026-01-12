
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const DEFAULT_TABLES = ['products', 'leads', 'customer_queries', 'sales'];

// GET /api/v1/chatbots - Retrieves a list of available database tables
export async function GET(req: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch user-connected tables
  const { data: tablesData, error: tablesError } = await supabase
    .from('user_connected_tables')
    .select('table_name')
    .eq('user_id', user.id);

  if (tablesError) {
    console.error("Error fetching user tables:", tablesError.message);
    return NextResponse.json({ error: 'Failed to retrieve database tables.' }, { status: 500 });
  }

  const customTableNames = tablesData?.map(t => t.table_name) || [];
  const allTables = Array.from(new Set([...DEFAULT_TABLES, ...customTableNames]));

  return NextResponse.json({ tables: allTables });
}

// POST /api/v1/chatbots - Creates a new chatbot
export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  let chatbotId = null; // Initialize chatbotId

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, goal, description, model, tone, theme, db_meta } = body;

    if (!name || !goal || !description || !model) {
      return NextResponse.json({ error: 'Missing required fields: name, goal, description, and model are required.' }, { status: 400 });
    }

    if (description.length < 200) {
        return NextResponse.json({ error: 'Project description must be at least 200 characters' }, { status: 400 });
    }

    const { data, error: insertError } = await supabase
      .from('chatbots')
      .insert({
        user_id: user.id,
        name,
        goal,
        description,
        model,
        tone: tone || 'Friendly',
        theme: theme || 'light',
        db_meta: db_meta || { tables: {} },
        status: 'active',
      })
      .select('id')
      .single();

    if (insertError) throw insertError;
    
    chatbotId = data.id;

    // Construct the deployment link
    const deploymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/deploy/${chatbotId}`;

    return NextResponse.json({ 
      message: "Chatbot created and deployed successfully!",
      chatbotId: chatbotId,
      deploymentLink: deploymentLink
    }, { status: 200 });

  } catch (error: any) {
    console.error('API Error:', error.message);
    // Determine the status code based on the error type
    const statusCode = error.message.includes('Unauthorized') ? 401 :
                       error.message.includes('Missing required fields') ? 400 :
                       error.message.includes('Project description must be at least 200 characters') ? 400 :
                       500;

    return NextResponse.json({ error: error.message }, { status: statusCode });
  }
}
