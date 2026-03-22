'use server'

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    // Parse request body
    let body: any
    try {
      const text = await request.text()
      if (!text) {
        return NextResponse.json({ error: 'Request body is empty' }, { status: 400 })
      }
      body = JSON.parse(text)
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const { pantryId } = body

    if (!pantryId || typeof pantryId !== 'string' || pantryId.trim() === '') {
      return NextResponse.json({ error: 'A valid Pantry ID is required' }, { status: 400 })
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const trimmedPantryId = pantryId.trim()

    // Update user's pantry_id in the database
    const { data, error } = await supabase
      .from('users')
      .update({ pantry_id: trimmedPantryId })
      .eq('id', user.id)
      .select('pantry_id')
      .single()

    if (error) {
      console.error("Error updating Pantry ID in database:", error)
      return NextResponse.json({ 
        error: 'Failed to save Pantry ID to your profile'
      }, { status: 500 })
    }

    if (!data) {
      console.error("No data returned after update")
      return NextResponse.json({ 
        error: 'Failed to confirm Pantry ID was saved'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Pantry ID connected successfully',
      data: {
        pantry_id: data.pantry_id
      }
    }, { status: 200 })

  } catch (error: any) {
    console.error("Unexpected error in POST /api/pantry/connect:", error)
    return NextResponse.json({ 
      error: 'An unexpected server error occurred'
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const { error } = await supabase
      .from('users')
      .update({ pantry_id: null })
      .eq('id', user.id)

    if (error) {
      console.error("Error disconnecting Pantry ID:", error)
      return NextResponse.json({ 
        error: 'Failed to disconnect Pantry ID'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Pantry successfully disconnected'
    }, { status: 200 })

  } catch (error: any) {
    console.error("Unexpected error in DELETE /api/pantry/connect:", error)
    return NextResponse.json({ 
      error: 'An unexpected server error occurred'
    }, { status: 500 })
  }
}
