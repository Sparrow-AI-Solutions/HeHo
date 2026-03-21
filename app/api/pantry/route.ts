import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const PANTRY_BASE_URL = 'https://getpantry.cloud/apiv1/pantry'

async function getPantryId() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Unauthorized: User not authenticated')
    }

    const { data, error } = await supabase
      .from('users')
      .select('pantry_id')
      .eq('id', user.id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch Pantry ID: ${error.message}`)
    }

    if (!data?.pantry_id) {
      throw new Error('Pantry ID not configured in user profile')
    }

    return data.pantry_id
  } catch (error: any) {
    throw new Error(error.message || 'Failed to retrieve Pantry ID')
  }
}

async function fetchFromPantry(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          error: `Pantry API returned non-JSON response: ${response.status}`,
        }
      }
      return {
        ok: true,
        status: response.status,
        data: {},
      }
    }

    const data = await response.json()

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: data.message || `Pantry API error: ${response.status}`,
      }
    }

    return {
      ok: true,
      status: response.status,
      data,
    }
  } catch (error: any) {
    return {
      ok: false,
      status: 500,
      error: `Network error: ${error.message}`,
    }
  }
}

export async function GET(request: Request) {
  try {
    const pantryId = await getPantryId()
    const { searchParams } = new URL(request.url)
    const basketName = searchParams.get('basket')

    let url = `${PANTRY_BASE_URL}/${pantryId}`
    if (basketName) {
      url = `${PANTRY_BASE_URL}/${pantryId}/basket/${encodeURIComponent(basketName)}`
    }

    const result = await fetchFromPantry(url)

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json(result.data, { status: 200 })
  } catch (error: any) {
    console.error('Error in GET /api/pantry:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch from Pantry' },
      { status: 400 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const pantryId = await getPantryId()

    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { basketName, data } = body

    if (!basketName || typeof basketName !== 'string' || basketName.trim() === '') {
      return NextResponse.json(
        { error: 'Basket name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    const url = `${PANTRY_BASE_URL}/${pantryId}/basket/${encodeURIComponent(basketName.trim())}`
    const result = await fetchFromPantry(url, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json(result.data, { status: 200 })
  } catch (error: any) {
    console.error('Error in POST /api/pantry:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create/update basket' },
      { status: 400 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const pantryId = await getPantryId()

    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { basketName, data } = body

    if (!basketName || typeof basketName !== 'string' || basketName.trim() === '') {
      return NextResponse.json(
        { error: 'Basket name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Data must be a valid JSON object' },
        { status: 400 }
      )
    }

    const url = `${PANTRY_BASE_URL}/${pantryId}/basket/${encodeURIComponent(basketName.trim())}`
    const result = await fetchFromPantry(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json(result.data, { status: 200 })
  } catch (error: any) {
    console.error('Error in PUT /api/pantry:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update basket' },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const pantryId = await getPantryId()
    const { searchParams } = new URL(request.url)
    const basketName = searchParams.get('basket')

    if (!basketName || basketName.trim() === '') {
      return NextResponse.json(
        { error: 'Basket name is required' },
        { status: 400 }
      )
    }

    const url = `${PANTRY_BASE_URL}/${pantryId}/basket/${encodeURIComponent(basketName.trim())}`
    const result = await fetchFromPantry(url, { method: 'DELETE' })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json(
      { message: 'Basket deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error in DELETE /api/pantry:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete basket' },
      { status: 400 }
    )
  }
}
