import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucketName = formData.get('bucketName') as string
    const filePath = formData.get('filePath') as string

    if (!file || !bucketName || !filePath) {
      return NextResponse.json({ error: 'File, bucket name, and file path are required' }, { status: 400 })
    }

    // Fetch the user's storage credentials
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('supabase_url, supabase_key_encrypted, storage_bucket')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'Could not retrieve user credentials' }, { status: 500 })
    }

    const { supabase_url, supabase_key_encrypted, storage_bucket } = userData

    if (!supabase_url || !supabase_key_encrypted) {
      return NextResponse.json({ error: 'User has not configured their Supabase connection' }, { status: 400 })
    }

    if (!storage_bucket) {
      return NextResponse.json({ error: 'User has not configured a storage bucket' }, { status: 400 })
    }

    if (bucketName !== storage_bucket) {
      return NextResponse.json({ error: 'Bucket name does not match user configured bucket' }, { status: 403 })
    }

    // Create user's Supabase client
    const userSupabase = createClient(supabase_url, supabase_key_encrypted)

    // Convert file to buffer
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await userSupabase.storage
      .from(bucketName)
      .upload(filePath, uint8Array, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: `Failed to upload file: ${uploadError.message}` }, { status: 500 })
    }

    // Get public URL for the uploaded file
    const { data: urlData } = userSupabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    if (!urlData || !urlData.publicUrl) {
      return NextResponse.json({ error: 'Failed to generate public URL for uploaded file' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'File uploaded successfully',
      fileUrl: urlData.publicUrl,
      filePath: uploadData?.path,
    })

  } catch (err: any) {
    console.error('Error in POST /api/database/upload-file:', err)
    return NextResponse.json({ error: err.message || 'An unexpected error occurred while uploading file' }, { status: 500 })
  }
}
