
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// Generate a random string for the API key
const generateApiKey = () => {
  return 'heho_' + randomBytes(16).toString('hex');
};

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Check if the user profile exists
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

    // If there's an error fetching the profile or the profile is null, ask user to recover profile
    if (profileError || !profile) {
        return NextResponse.json({ error: 'User profile not found. Please use the Account Recovery option on the settings page.' }, { status: 404 });
    }
    
    const apiKey = generateApiKey();

    // Since we are no longer hashing, we store the key directly.
    // Note: This is less secure. We are doing this based on the user's explicit request.
    const { error: updateError } = await supabase
      .from('users')
      .update({ api_key_hash: apiKey })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save API key to the database.', details: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ apiKey });

  } catch (error: any) {
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ api_key_hash: null })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to delete API key.', details: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'API key deleted successfully.' });

  } catch (error: any) {
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}
