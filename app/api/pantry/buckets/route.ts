'use server'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET: Fetch all Pantry buckets and the ones connected by the user
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('pantry_id')
      .eq('id', user.id)
      .single()

    if (userError || !userData || !userData.pantry_id) {
      return NextResponse.json({ error: 'Pantry ID not configured.' }, { status: 400 })
    }

    const { pantry_id: pantryId } = userData

    // Fetch all buckets from Pantry
    const pantryResponse = await fetch(`https://getpantry.cloud/apiv1/pantry/${pantryId}`)
    if (!pantryResponse.ok) {
        throw new Error('Failed to fetch from Pantry. Check your Pantry ID.')
    }
    const pantryData = await pantryResponse.json()
    // The API returns 'baskets' which we are calling buckets for consistency
    const allBuckets = pantryData.baskets?.map((b: { name: string }) => b.name) || []

    // Fetch connected buckets from Supabase
    const { data: connectedBucketsData, error: dbError } = await supabase
      .from('user_connected_pantry_duplicate')
      .select('table_name')
      .eq('user_id', user.id)

    if (dbError) throw dbError

    const connectedBuckets = connectedBucketsData.map(b => b.table_name)

    return NextResponse.json({ allBuckets, connectedBuckets })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create a new bucket in Pantry and connect it
export async function POST(request: Request) {
    const supabase = createRouteHandlerClient({ cookies })
    const { bucketName } = await request.json()

    if (!bucketName || typeof bucketName !== 'string' || bucketName.trim().length === 0) {
        return NextResponse.json({ error: 'Bucket name is required and cannot be empty' }, { status: 400 })
    }

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: userData } = await supabase.from('users').select('pantry_id').eq('id', user.id).single()
        if (!userData || !userData.pantry_id) {
            return NextResponse.json({ error: 'Pantry ID not configured.' }, { status: 400 })
        }
        
        const { pantry_id: pantryId } = userData

        // 1. Create the bucket in Pantry (Pantry API uses PUT for creation)
        const pantryResponse = await fetch(`https://getpantry.cloud/apiv1/pantry/${pantryId}/basket/${bucketName.trim()}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: 'Created from HeHo.ai' })
        })

        if (!pantryResponse.ok) {
            const errorText = await pantryResponse.text()
            // Pantry returns a 400 if the basket already exists
            if(pantryResponse.status === 400 && errorText.includes("already exists")) {
                 return NextResponse.json({ error: `Bucket '${bucketName.trim()}' already exists in your Pantry.` }, { status: 400 })
            }
            throw new Error(`Failed to create Pantry bucket: ${errorText}`)
        }

        // 2. Automatically connect the new bucket in our DB
        const { error: connectError } = await supabase
            .from('user_connected_pantry_duplicate')
            .insert({ user_id: user.id, table_name: bucketName.trim() })

        if (connectError) {
            // In a production scenario, you might want to try and delete the basket from pantry if this fails.
            throw connectError
        }

        return NextResponse.json({ message: `Bucket '${bucketName.trim()}' created and connected successfully.` })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}


// PUT: Connect an existing bucket
export async function PUT(request: Request) {
    const supabase = createRouteHandlerClient({ cookies })
    const { bucketName } = await request.json()

    if (!bucketName) {
        return NextResponse.json({ error: 'Bucket name is required' }, { status: 400 })
    }
    
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { error } = await supabase
            .from('user_connected_pantry_duplicate')
            .insert({ user_id: user.id, table_name: bucketName })

        if (error) throw error

        return NextResponse.json({ message: `Bucket '${bucketName}' connected successfully.` })
    } catch (error: any) {
        if (error.code === '23505') {
            return NextResponse.json({ message: `Bucket '${bucketName}' is already connected.` })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE: Disconnect a bucket
export async function DELETE(request: Request) {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const bucketName = searchParams.get('bucketName')

    if (!bucketName) {
        return NextResponse.json({ error: 'Bucket name is required for deletion' }, { status: 400 })
    }

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { error } = await supabase
            .from('user_connected_pantry_duplicate')
            .delete()
            .eq('user_id', user.id)
            .eq('table_name', bucketName)

        if (error) throw error

        return NextResponse.json({ message: `Bucket '${bucketName}' disconnected successfully.` })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
