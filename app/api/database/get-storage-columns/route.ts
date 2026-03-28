import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const normalizeStorageColumns = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((col): col is string => typeof col === 'string' && col.trim().length > 0)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []

    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.filter((col): col is string => typeof col === 'string' && col.trim().length > 0)
      }
    } catch {
      // value is not JSON, fall back to comma-separated parsing
    }

    return trimmed.split(',').map((item) => item.trim()).filter(Boolean)
  }

  return []
}

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

    const storageColumns = normalizeStorageColumns(userData.storage_columns)
    const storageBucket = userData.storage_bucket || ""

    return NextResponse.json({ storageColumns, storageBucket })

  } catch (err: any) {
    console.error('Error in GET /api/database/get-storage-columns:', err)
    return NextResponse.json({ storageColumns: [], storageBucket: "" })
  }
}
