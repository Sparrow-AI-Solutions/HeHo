import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error("Auth error in GET /api/pantry/buckets:", authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all baskets from Pantry
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('pantry_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.pantry_id) {
      console.error("Error fetching user pantry_id:", userError)
      return NextResponse.json({ error: 'Pantry not configured' }, { status: 400 })
    }

    const pantryId = userData.pantry_id

    // Fetch from Pantry API to get all baskets
    const pantryResponse = await fetch(`https://getpantry.cloud/apiv1/pantry/${pantryId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!pantryResponse.ok) {
      console.error("Error fetching from Pantry API:", pantryResponse.status)
      return NextResponse.json({ error: 'Failed to fetch baskets from Pantry' }, { status: 500 })
    }

    let pantryData
    try {
      pantryData = await pantryResponse.json()
    } catch (e) {
      console.error("Error parsing Pantry response:", e)
      return NextResponse.json({ error: 'Invalid response from Pantry' }, { status: 500 })
    }

    const baskets = pantryData.baskets || []

    return NextResponse.json({ 
      data: baskets.map((b: any) => ({
        name: b.name,
        ttl: b.ttl
      }))
    }, { status: 200 })
  } catch (error: any) {
    console.error("Error in GET /api/pantry/buckets:", error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    let body: any
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const { bucketName } = body

    if (!bucketName || typeof bucketName !== 'string' || bucketName.trim() === '') {
      return NextResponse.json({ error: 'Bucket name is required' }, { status: 400 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error("Auth error in POST /api/pantry/buckets:", authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trimmedBucketName = bucketName.trim()

    // Get user's Pantry ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('pantry_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.pantry_id) {
      console.error("Error fetching user pantry_id:", userError)
      return NextResponse.json({ error: 'Pantry not configured' }, { status: 400 })
    }

    const pantryId = userData.pantry_id

    // Create bucket in Pantry by posting empty data
    const createResponse = await fetch(
      `https://getpantry.cloud/apiv1/pantry/${pantryId}/basket/${encodeURIComponent(trimmedBucketName)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      }
    )

    if (!createResponse.ok) {
      console.error("Error creating basket in Pantry:", createResponse.status)
      return NextResponse.json({ error: 'Failed to create bucket in Pantry' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Bucket created successfully',
      data: { name: trimmedBucketName }
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/pantry/buckets:", error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { searchParams } = new URL(request.url)
    const bucketName = searchParams.get('name')

    if (!bucketName) {
      return NextResponse.json({ error: 'Bucket name is required' }, { status: 400 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error("Auth error in DELETE /api/pantry/buckets:", authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Pantry ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('pantry_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.pantry_id) {
      console.error("Error fetching user pantry_id:", userError)
      return NextResponse.json({ error: 'Pantry not configured' }, { status: 400 })
    }

    const pantryId = userData.pantry_id

    // Delete bucket from Pantry
    const deleteResponse = await fetch(
      `https://getpantry.cloud/apiv1/pantry/${pantryId}/basket/${encodeURIComponent(bucketName)}`,
      { method: 'DELETE' }
    )

    if (!deleteResponse.ok) {
      console.error("Error deleting basket from Pantry:", deleteResponse.status)
      return NextResponse.json({ error: 'Failed to delete bucket from Pantry' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Bucket deleted successfully' }, { status: 200 })
  } catch (error: any) {
    console.error("Error in DELETE /api/pantry/buckets:", error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
