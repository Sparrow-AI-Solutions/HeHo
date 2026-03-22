import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const PANTRY_API = 'https://getpantry.cloud/apiv1/pantry'

async function getPantryId() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('users')
    .select('pantry_id')
    .eq('id', user.id)
    .single()

  if (error || !data?.pantry_id) {
    throw new Error('Pantry ID not configured')
  }

  return data.pantry_id
}

export async function GET() {
  try {
    const pantryId = await getPantryId()

    const response = await fetch(`${PANTRY_API}/${pantryId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Pantry API error: ${response.status}` }, { status: response.status })
    }

    const text = await response.text()
    const pantryData = text ? JSON.parse(text) : {}

    return NextResponse.json({ 
      data: pantryData.baskets || []
    }, { status: 200 })
  } catch (error: any) {
    console.error('Error in GET /api/pantry/buckets:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function POST(request: Request) {
  try {
    const pantryId = await getPantryId()

    let body: any
    try {
      const text = await request.text()
      body = text ? JSON.parse(text) : {}
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const { basket } = body

    if (!basket || typeof basket !== 'string' || basket.trim() === '') {
      return NextResponse.json({ error: 'Basket name is required' }, { status: 400 })
    }

    const url = `${PANTRY_API}/${pantryId}/basket/${encodeURIComponent(basket.trim())}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Pantry API error: ${response.status}` }, { status: response.status })
    }

    return NextResponse.json({ 
      message: 'Basket created successfully',
      data: { name: basket.trim() }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/pantry/buckets:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const pantryId = await getPantryId()
    const { searchParams } = new URL(request.url)
    const basket = searchParams.get('basket')

    if (!basket || basket.trim() === '') {
      return NextResponse.json({ error: 'Basket name is required' }, { status: 400 })
    }

    const url = `${PANTRY_API}/${pantryId}/basket/${encodeURIComponent(basket.trim())}`
    const response = await fetch(url, { method: 'DELETE' })

    if (!response.ok) {
      return NextResponse.json({ error: `Pantry API error: ${response.status}` }, { status: response.status })
    }

    return NextResponse.json({ message: 'Basket deleted successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Error in DELETE /api/pantry/buckets:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
