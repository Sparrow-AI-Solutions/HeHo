'use server'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { pantryId } = await request.json()

    if (!pantryId || typeof pantryId !== 'string') {
      return NextResponse.json({ error: 'A valid Pantry ID is required.' }, { status: 400 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Directly update the user's record without external validation
    const { data, error } = await supabase
      .from('users')
      .update({ pantry_id: pantryId })
      .eq('id', user.id)
      .select('pantry_id')
      .single()

    if (error) {
      console.error("Error saving Pantry ID:", error)
      return NextResponse.json({ error: "Failed to save Pantry ID to your profile." }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Pantry successfully connected!', 
      data 
    })

  } catch (error: any) {
    // This will catch errors from a malformed request body (e.g., not valid JSON)
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid request format.' }, { status: 400 });
    }
    console.error("Unexpected error in /api/pantry/connect:", error)
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 })
  }
}

export async function DELETE() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('users')
      .update({ pantry_id: null })
      .eq('id', user.id)

    if (error) {
      console.error("Error disconnecting Pantry ID:", error)
      return NextResponse.json({ error: "Failed to disconnect Pantry ID." }, { status: 500 })
    }

    return NextResponse.json({ message: 'Pantry successfully disconnected!' })

  } catch (error: any) {
    console.error("Unexpected error in DELETE /api/pantry/connect:", error)
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 })
  }
}
