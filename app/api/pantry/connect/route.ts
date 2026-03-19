'use server'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { pantryId } = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  if (!pantryId) {
    return NextResponse.json({ error: 'Pantry ID is required' }, { status: 400 })
  }

  try {
    // 1. Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate the Pantry ID by trying to fetch it
    const pantryResponse = await fetch(`https://getpantry.cloud/apiv1/pantry/${pantryId}`)

    if (!pantryResponse.ok) {
        // Pantry returns a 400 for invalid ID format and 404 if not found
        if (pantryResponse.status === 400 || pantryResponse.status === 404) {
            return NextResponse.json({ error: 'Invalid or non-existent Pantry ID.' }, { status: 400 });
        }
        // Handle other potential server errors from Pantry
        return NextResponse.json({ error: 'Could not verify Pantry ID. The service may be down.' }, { status: 500 });
    }

    // 3. Update the user's record in Supabase
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
