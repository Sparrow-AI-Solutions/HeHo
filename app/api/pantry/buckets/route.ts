import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('user_connected_pantry_buckets')
      .select('id, bucket_name, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching buckets:", error)
      return NextResponse.json({ error: 'Failed to fetch buckets' }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] }, { status: 200 })
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
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const { bucketName } = body

    if (!bucketName || typeof bucketName !== 'string' || bucketName.trim() === '') {
      return NextResponse.json({ error: 'Bucket name is required' }, { status: 400 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trimmedBucketName = bucketName.trim()

    const { data, error } = await supabase
      .from('user_connected_pantry_buckets')
      .insert({
        user_id: user.id,
        bucket_name: trimmedBucketName
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding bucket:", error)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This bucket is already connected' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to add bucket' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Bucket added successfully',
      data 
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
    const bucketId = searchParams.get('id')

    if (!bucketId) {
      return NextResponse.json({ error: 'Bucket ID is required' }, { status: 400 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('user_connected_pantry_buckets')
      .delete()
      .eq('id', bucketId)
      .eq('user_id', user.id)

    if (error) {
      console.error("Error deleting bucket:", error)
      return NextResponse.json({ error: 'Failed to delete bucket' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Bucket deleted successfully' }, { status: 200 })
  } catch (error: any) {
    console.error("Error in DELETE /api/pantry/buckets:", error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
