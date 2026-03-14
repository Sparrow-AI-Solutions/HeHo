import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { executeSupabaseQuery } from '@/lib/supabase/management-api'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { tableName, columns } = await request.json()

    if (!tableName || !columns || !Array.isArray(columns) || columns.length === 0) {
      return NextResponse.json({ error: 'Table name and columns are required' }, { status: 400 })
    }

    // Validate table name
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return NextResponse.json({ error: 'Invalid table name. Use only letters, numbers, and underscores.' }, { status: 400 })
    }

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

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error('Session error in /api/database/create-table:', sessionError)
      return NextResponse.json({ error: 'Unauthorized: No active session found. Please log in again.' }, { status: 401 })
    }

    const user = session.user

    // Construct SQL query
    const columnDefs = columns.map((col: any) => {
      let def = `${col.name} ${col.type}`
      if (col.primaryKey) def += ' PRIMARY KEY'
      if (col.notNull) def += ' NOT NULL'
      if (col.defaultValue && col.defaultValue.trim()) {
        def += ` DEFAULT ${col.defaultValue}`
      }
      return def
    }).join(', ')

    const sqlQuery = `CREATE TABLE IF NOT EXISTS public.${tableName} (${columnDefs});`

    console.log(`User ${user.id} executing CREATE TABLE for ${tableName}`)

    const result = await executeSupabaseQuery(supabase, user.id, sqlQuery)

    if (result.error) {
      console.error(`Query failed for user ${user.id}:`, result.error)
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    // If table created successfully, add it to user_connected_tables
    const { error: insertError } = await supabase
      .from('user_connected_tables')
      .insert({ user_id: user.id, table_name: tableName })

    if (insertError && insertError.code !== '23505') {
      console.error('Error adding created table to user_connected_tables:', insertError)
    }

    return NextResponse.json({ 
      message: 'Table created successfully', 
      tableName: tableName,
      result: result.data 
    })
  } catch (err: any) {
    console.error('Unhandled error in /api/database/create-table:', err)
    return NextResponse.json({ error: `An unexpected error occurred: ${err.message}` }, { status: 500 })
  }
}
