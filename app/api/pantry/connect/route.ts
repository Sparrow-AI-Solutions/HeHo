'use server'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Handle cases where the client accidentally sends a GET request
export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint should be called with POST to connect, or DELETE to disconnect. GET is not a supported method.' },
    { status: 405 } // 405 Method Not Allowed
  );
}

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
      message: 'Pantry ID saved successfully!', 
      data 
    })

  } catch (error: any) {
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid request format. Make sure the data is being sent correctly.' }, { status: 400 });
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
