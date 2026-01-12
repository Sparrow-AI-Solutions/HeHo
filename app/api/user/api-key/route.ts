
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// POST /api/user/api-key - Generates a new API key
export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: User not found or session expired. Please log in again.' }, { status: 401 });
    }

    // Generate a new API key
    const apiKey = `saas_${crypto.randomBytes(24).toString('hex')}`;
    // Hash the API key for storage
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Store the hash in the user's record
    const { error: updateError } = await supabase
      .from('users')
      .update({ api_key_hash: hashedKey })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to save API key hash:', updateError);
      return NextResponse.json({ error: 'Database error: Could not save API key.' }, { status: 500 });
    }

    // Return the unhashed key to the user. This is the only time it will be shown.
    return NextResponse.json({ apiKey });

  } catch (error: any) {
    console.error('Error generating API key:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/user/api-key - Deletes the user's API key
export async function DELETE(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: User not found or session expired. Please log in again.' }, { status: 401 });
    }

    // Remove the API key hash from the user's record
    const { error: updateError } = await supabase
      .from('users')
      .update({ api_key_hash: null })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to delete API key hash:', updateError);
      return NextResponse.json({ error: 'Database error: Could not delete API key.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'API key deleted successfully' });

  } catch (error: any) {
    console.error('Error deleting API key:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
