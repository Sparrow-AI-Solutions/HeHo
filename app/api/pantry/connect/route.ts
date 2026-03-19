'use server'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { pantryId } = await request.json()

    if (!pantryId || typeof pantryId !== 'string') {
      return NextResponse.json({ error: 'A valid Pantry ID is required' }, { status: 400 })
    }

    // 1. Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate the Pantry ID by trying to fetch it
    const pantryResponse = await fetch(`https://getpantry.cloud/apiv1/pantry/${pantryId}`)

    if (!pantryResponse.ok) {
        if (pantryResponse.status === 400 || pantryResponse.status === 404) {
            return NextResponse.json({ error: 'Invalid or non-existent Pantry ID.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Could not verify Pantry ID. The service may be down.' }, { status: 500 });
    }
    
    // 3. Also, try to parse the response to ensure the pantry is not empty/malformed
    try {
      await pantryResponse.json();
    } catch (e) {
      return NextResponse.json({ error: 'Pantry ID seems valid, but the pantry itself is empty or contains malformed data.' }, { status: 400 });
    }

    // 4. Update the user's record in Supabase
    const { data, error } = await supabase
      .from('users')
      .update({ pantry_id: pantryId })
      .eq('id', user.id)
      .select('pantry_id')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      message: 'Pantry successfully connected!', 
      data 
    })

  } catch (error: any) {
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid request. Make sure you are sending valid JSON.' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function DELETE() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // 1. Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Update the user's record in Supabase to remove the pantry_id
    const { error } = await supabase
      .from('users')
      .update({ pantry_id: null })
      .eq('id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Pantry successfully disconnected!' })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 })
  }
}
