import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

    // Validate columns
    for (const col of columns) {
      if (!col.name || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col.name)) {
        return NextResponse.json({ error: `Invalid column name: ${col.name}` }, { status: 400 })
      }
      if (!col.type) {
        return NextResponse.json({ error: `Column ${col.name} must have a type` }, { status: 400 })
      }
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
      if (col.defaultValue && col.defaultValue.trim()) {
        def += ` DEFAULT ${col.defaultValue}`
      }
      return def
    }).join(', ')

    const sqlQuery = `CREATE TABLE IF NOT EXISTS public.${tableName} (${columnDefs});`

    console.log('Executing SQL query:', sqlQuery)

    // Call the database query endpoint using internal URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 3000}`
    const queryUrl = `${baseUrl}/api/database/query`
    
    console.log('Calling query endpoint:', queryUrl)

    const queryResponse = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': request.headers.get('cookie') || '' },
      body: JSON.stringify({ query: sqlQuery })
    })

    const queryText = await queryResponse.text()
    console.log('Query response status:', queryResponse.status)
    console.log('Query response body:', queryText)

    let queryResult
    try {
      queryResult = JSON.parse(queryText)
    } catch (parseErr) {
      console.error('Failed to parse query response:', queryText)
      return NextResponse.json({ error: `Query API returned invalid response: ${queryText}` }, { status: 500 })
    }

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

    return NextResponse.json({ 
      message: 'Table created successfully', 
      tableName: `public.${tableName}`,
      result: queryResult 
    })
  } catch (err: any) {
    console.error('Error in /api/database/create-table:', err)
    return NextResponse.json({ error: err.message || 'An unexpected error occurred.' }, { status: 500 })
  }
}
