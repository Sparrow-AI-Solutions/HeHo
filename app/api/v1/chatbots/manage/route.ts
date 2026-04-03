
import { createClient as createSupabaseAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    .select('id')
    .eq('heho_api_key', apiKey)
    .single();

  if (error || !user) {
    return null;
  }
  return user.id;
}

// GET /api/v1/chatbots/manage - List all chatbots for the user
export async function GET(req: Request) {
  const userId = await authenticate(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: chatbots, error } = await supabaseAdmin
    .from('chatbots')
    .select('id, name, goal, model, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch chatbots', details: error.message }, { status: 500, headers: corsHeaders });
  }

  return NextResponse.json({ chatbots }, { status: 200, headers: corsHeaders });
}

// POST /api/v1/chatbots/manage - Create a new chatbot
export async function POST(req: Request) {
  const userId = await authenticate(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      name, goal, description, model, tone, theme,
      data_table_1, data_table_1_read, data_table_1_write, data_table_1_edit,
      data_table_2, data_table_2_read, data_table_2_write, data_table_2_edit,
      data_table_3, data_table_3_read, data_table_3_write, data_table_3_edit
    } = body;

    if (!name || !goal || !description || !model) {
      return NextResponse.json({ error: 'Missing required fields: name, goal, description, and model are required.' }, { status: 400, headers: corsHeaders });
    }

    if (description.length < 200) {
      return NextResponse.json({ error: 'Project description must be at least 200 characters' }, { status: 400, headers: corsHeaders });
    }

    const supabaseAdmin = createSupabaseAdminClient();
    
    // Check chatbot limit (similar to UI logic)
    const { count } = await supabaseAdmin
      .from('chatbots')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (count !== null && count >= 50) {
      return NextResponse.json({ error: 'You have reached the limit of 50 chatbots.' }, { status: 403, headers: corsHeaders });
    }

    const { data, error: insertError } = await supabaseAdmin
      .from('chatbots')
      .insert({
        user_id: userId,
        name,
        goal,
        description,
        model,
        tone: tone || 'professional',
        theme: theme || 'sky',
        data_table_1: data_table_1 === '_none_' ? null : data_table_1,
        data_table_1_read: !!data_table_1_read,
        data_table_1_write: !!data_table_1_write,
        data_table_1_edit: !!data_table_1_edit,
        data_table_2: data_table_2 === '_none_' ? null : data_table_2,
        data_table_2_read: !!data_table_2_read,
        data_table_2_write: !!data_table_2_write,
        data_table_2_edit: !!data_table_2_edit,
        data_table_3: data_table_3 === '_none_' ? null : data_table_3,
        data_table_3_read: !!data_table_3_read,
        data_table_3_write: !!data_table_3_write,
        data_table_3_edit: !!data_table_3_edit,
        status: 'active',
      })
      .select('id, name')
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ 
      message: "Chatbot created successfully!",
      chatbotId: data.id,
      name: data.name
    }, { status: 201, headers: corsHeaders });

  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// PUT /api/v1/chatbots/manage - Update a chatbot
export async function PUT(req: Request) {
  const userId = await authenticate(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      chatbotId,
      name, goal, description, model, tone, theme,
      data_table_1, data_table_1_read, data_table_1_write, data_table_1_edit,
      data_table_2, data_table_2_read, data_table_2_write, data_table_2_edit,
      data_table_3, data_table_3_read, data_table_3_write, data_table_3_edit
    } = body;

    if (!chatbotId) {
      return NextResponse.json({ error: 'chatbotId is required' }, { status: 400, headers: corsHeaders });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (goal !== undefined) updateData.goal = goal;
    if (description !== undefined) {
      if (description.length < 200) {
        return NextResponse.json({ error: 'Project description must be at least 200 characters' }, { status: 400, headers: corsHeaders });
      }
      updateData.description = description;
    }
    if (model !== undefined) updateData.model = model;
    if (tone !== undefined) updateData.tone = tone;
    if (theme !== undefined) updateData.theme = theme;
    
    if (data_table_1 !== undefined) updateData.data_table_1 = data_table_1 === '_none_' ? null : data_table_1;
    if (data_table_1_read !== undefined) updateData.data_table_1_read = !!data_table_1_read;
    if (data_table_1_write !== undefined) updateData.data_table_1_write = !!data_table_1_write;
    if (data_table_1_edit !== undefined) updateData.data_table_1_edit = !!data_table_1_edit;
    
    if (data_table_2 !== undefined) updateData.data_table_2 = data_table_2 === '_none_' ? null : data_table_2;
    if (data_table_2_read !== undefined) updateData.data_table_2_read = !!data_table_2_read;
    if (data_table_2_write !== undefined) updateData.data_table_2_write = !!data_table_2_write;
    if (data_table_2_edit !== undefined) updateData.data_table_2_edit = !!data_table_2_edit;
    
    if (data_table_3 !== undefined) updateData.data_table_3 = data_table_3 === '_none_' ? null : data_table_3;
    if (data_table_3_read !== undefined) updateData.data_table_3_read = !!data_table_3_read;
    if (data_table_3_write !== undefined) updateData.data_table_3_write = !!data_table_3_write;
    if (data_table_3_edit !== undefined) updateData.data_table_3_edit = !!data_table_3_edit;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields provided for update' }, { status: 400, headers: corsHeaders });
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const { data, error: updateError } = await supabaseAdmin
      .from('chatbots')
      .update(updateData)
      .eq('id', chatbotId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update chatbot', details: updateError.message }, { status: 500, headers: corsHeaders });
    }

    return NextResponse.json({ 
      message: "Chatbot updated successfully!",
      chatbot: data
    }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// DELETE /api/v1/chatbots/manage - Delete a chatbot
export async function DELETE(req: Request) {
  const userId = await authenticate(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  try {
    const { searchParams } = new URL(req.url);
    const chatbotId = searchParams.get('chatbotId');

    if (!chatbotId) {
      // Try to get from body if not in query param
      try {
        const body = await req.json();
        if (body.chatbotId) {
          const supabaseAdmin = createSupabaseAdminClient();
          const { error } = await supabaseAdmin
            .from('chatbots')
            .delete()
            .eq('id', body.chatbotId)
            .eq('user_id', userId);

          if (error) throw error;
          return NextResponse.json({ message: 'Chatbot deleted successfully.' }, { status: 200, headers: corsHeaders });
        }
      } catch (e) {
        // Body might be empty or not JSON
      }
      return NextResponse.json({ error: 'Missing chatbotId parameter.' }, { status: 400, headers: corsHeaders });
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const { error } = await supabaseAdmin
      .from('chatbots')
      .delete()
      .eq('id', chatbotId)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ message: 'Chatbot deleted successfully.' }, { status: 200, headers: corsHeaders });

  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
