import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const PANTRY_BASE_URL = 'https://getpantry.cloud/apiv1/pantry'

async function getPantryId() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('pantry_id')
    .eq('id', user.id)
    .single()

  return data?.pantry_id || null
}

export async function GET(request: Request) {
  const pantryId = await getPantryId()
  if (!pantryId) {
    return NextResponse.json({ error: 'Pantry ID not configured' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const basketName = searchParams.get('basket')

  try {
    const url = basketName 
      ? `${PANTRY_BASE_URL}/${pantryId}/basket/${basketName}`
      : `${PANTRY_BASE_URL}/${pantryId}`

    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Failed to fetch from Pantry' }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const pantryId = await getPantryId()
  if (!pantryId) {
    return NextResponse.json({ error: 'Pantry ID not configured' }, { status: 400 })
  }

  try {
    const { basketName, data } = await request.json()
    if (!basketName) {
      return NextResponse.json({ error: 'Basket name is required' }, { status: 400 })
    }

    const response = await fetch(`${PANTRY_BASE_URL}/${pantryId}/basket/${basketName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    })

    const result = await response.json()
    if (!response.ok) {
      return NextResponse.json({ error: result.message || 'Failed to create/update basket' }, { status: response.status })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const pantryId = await getPantryId()
  if (!pantryId) {
    return NextResponse.json({ error: 'Pantry ID not configured' }, { status: 400 })
  }

  try {
    const { basketName, data } = await request.json()
    if (!basketName) {
      return NextResponse.json({ error: 'Basket name is required' }, { status: 400 })
    }

    const response = await fetch(`${PANTRY_BASE_URL}/${pantryId}/basket/${basketName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    const result = await response.json()
    if (!response.ok) {
      return NextResponse.json({ error: result.message || 'Failed to update basket' }, { status: response.status })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const pantryId = await getPantryId()
  if (!pantryId) {
    return NextResponse.json({ error: 'Pantry ID not configured' }, { status: 400 })
  }

  const { searchParams } = new URL(request.url)
  const basketName = searchParams.get('basket')

  if (!basketName) {
    return NextResponse.json({ error: 'Basket name is required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${PANTRY_BASE_URL}/${pantryId}/basket/${basketName}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const data = await response.json()
      return NextResponse.json({ error: data.message || 'Failed to delete basket' }, { status: response.status })
    }

    return NextResponse.json({ message: 'Basket deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
