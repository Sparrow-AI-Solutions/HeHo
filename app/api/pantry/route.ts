import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const PANTRY_API = 'https://getpantry.cloud/apiv1/pantry'

async function getPantryId() {
  const supabase = createRouteHandlerClient({ cookies })
  
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

export async function GET(request: Request) {
  try {
    const pantryId = await getPantryId()
    const { searchParams } = new URL(request.url)
    const basket = searchParams.get('basket')

    let url = `${PANTRY_API}/${pantryId}`
    if (basket) {
      url = `${PANTRY_API}/${pantryId}/basket/${encodeURIComponent(basket)}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Pantry API error: ${response.status}` }, { status: response.status })
    }

    const text = await response.text()
    const data = text ? JSON.parse(text) : {}

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Error in GET /api/pantry:', error)
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

    const { basket, data } = body

    if (!basket || typeof basket !== 'string' || basket.trim() === '') {
      return NextResponse.json({ error: 'Basket name is required' }, { status: 400 })
    }

    const url = `${PANTRY_API}/${pantryId}/basket/${encodeURIComponent(basket.trim())}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Pantry API error: ${response.status}` }, { status: response.status })
    }

    const text = await response.text()
    const result = text ? JSON.parse(text) : {}

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Error in POST /api/pantry:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    const pantryId = await getPantryId()

    let body: any
    try {
      const text = await request.text()
      body = text ? JSON.parse(text) : {}
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const { basket, data } = body

    if (!basket || typeof basket !== 'string' || basket.trim() === '') {
      return NextResponse.json({ error: 'Basket name is required' }, { status: 400 })
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Data must be a valid JSON object' }, { status: 400 })
    }

    const url = `${PANTRY_API}/${pantryId}/basket/${encodeURIComponent(basket.trim())}`
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Pantry API error: ${response.status}` }, { status: response.status })
    }

    const text = await response.text()
    const result = text ? JSON.parse(text) : {}

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Error in PUT /api/pantry:', error)
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
    console.error('Error in DELETE /api/pantry:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
