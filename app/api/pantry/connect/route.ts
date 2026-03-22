'use server'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint should be called with POST to connect, or DELETE to disconnect. GET is not a supported method.' },
    { status: 405 }
  );
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 })
    }

    const { pantryId } = body

    if (!pantryId || typeof pantryId !== 'string' || pantryId.trim() === '') {
      return NextResponse.json({ error: 'A valid Pantry ID is required.' }, { status: 400 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trimmedPantryId = pantryId.trim()

    const { data, error } = await supabase
      .from('users')
      .update({ pantry_id: trimmedPantryId })
      .eq('id', user.id)
      .select('pantry_id')
      .single()

    if (error) {
      console.error("Error saving Pantry ID:", error)
      return NextResponse.json({ 
        error: "Failed to save Pantry ID to your profile.",
        details: error.message 
      }, { status: 500 })
    }

    if (!data) {
      console.error("No data returned after update")
      return NextResponse.json({ 
        error: "Failed to confirm Pantry ID was saved." 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Pantry ID saved successfully!', 
      data: {
        pantry_id: data.pantry_id || trimmedPantryId
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error("Unexpected error in POST /api/pantry/connect:", error)
    return NextResponse.json({ 
      error: 'An unexpected server error occurred.',
      details: error.message 
    }, { status: 500 })
  }
}

export async function DELETE() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('users')
      .update({ pantry_id: null })
      .eq('id', user.id)

    if (error) {
      console.error("Error disconnecting Pantry ID:", error)
      return NextResponse.json({ 
        error: "Failed to disconnect Pantry ID.",
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Pantry successfully disconnected!' 
    }, { status: 200 })

  } catch (error: any) {
    console.error("Unexpected error in DELETE /api/pantry/connect:", error)
    return NextResponse.json({ 
      error: 'An unexpected server error occurred.',
      details: error.message 
    }, { status: 500 })
  }
}
