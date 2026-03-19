import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
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
    // Fetch the user's storage columns and bucket
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('storage_columns, storage_bucket')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      console.error('Error fetching user storage config:', userError)
      return NextResponse.json({ storageColumns: [], storageBucket: "" })
    }

    const storageColumns = userData.storage_columns || []
    const storageBucket = userData.storage_bucket || ""

    return NextResponse.json({ storageColumns, storageBucket })

  } catch (err: any) {
    console.error('Error in GET /api/database/get-storage-columns:', err)
    return NextResponse.json({ storageColumns: [], storageBucket: "" })
  }
}
