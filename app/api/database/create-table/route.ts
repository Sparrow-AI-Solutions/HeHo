import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { tableName, columns } = await request.json()

  if (!tableName || !columns || !Array.isArray(columns) || columns.length === 0) {
    return NextResponse.json({ error: 'Table name and columns are required' }, { status: 400 })
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Construct SQL query
  const columnDefs = columns.map((col: any) => {
    let def = `${col.name} ${col.type}`
    if (col.primaryKey) def += ' PRIMARY KEY'
    if (col.notNull) def += ' NOT NULL'
    if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`
    return def
  }).join(', ')

  const sqlQuery = `CREATE TABLE IF NOT EXISTS public.${tableName} (${columnDefs});`

  // Call the database query endpoint
  const queryResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieStore.toString() },
    body: JSON.stringify({ query: sqlQuery })
  })

  const queryResult = await queryResponse.json()
  if (!queryResponse.ok) {
    return NextResponse.json({ error: queryResult.error || 'Failed to create table' }, { status: queryResponse.status })
  }

  // If table created successfully, add it to user_connected_tables
  const { error: insertError } = await supabase
    .from('user_connected_tables')
    .insert({ user_id: user.id, table_name: `public.${tableName}` })

  if (insertError && insertError.code !== '23505') {
    console.error('Error adding created table to user_connected_tables:', insertError)
  }

  return NextResponse.json({ message: 'Table created successfully', result: queryResult })
}
