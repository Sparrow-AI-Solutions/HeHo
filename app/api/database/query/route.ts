import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { query, projectId } = await request.json()

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
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

  // Get user's tokens and project info
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('provider_token, refresh_token, supabase_url')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    return NextResponse.json({ error: 'Could not retrieve your Supabase credentials.' }, { status: 500 })
  }

  let accessToken = userData.provider_token
  const refreshToken = userData.refresh_token
  
  // Extract project ID from supabase_url if not provided
  let finalProjectId = projectId
  if (!finalProjectId && userData.supabase_url) {
    const match = userData.supabase_url.match(/https:\/\/(.*?)\.supabase\.co/)
    if (match) {
      finalProjectId = match[1]
    }
  }

  if (!finalProjectId) {
    return NextResponse.json({ error: 'Project ID could not be determined.' }, { status: 400 })
  }

  async function performQuery(token: string) {
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${finalProjectId}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      }
    )
    return res
  }

  try {
    let response = await performQuery(accessToken)

    // If unauthorized, try to refresh the token
    if (response.status === 401 && refreshToken) {
      const refreshRes = await fetch('https://api.supabase.com/v1/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      })

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        const newAccessToken = refreshData.access_token
        const newRefreshToken = refreshData.refresh_token

        // Update tokens in database
        await supabase
          .from('users')
          .update({
            provider_token: newAccessToken,
            refresh_token: newRefreshToken
          })
          .eq('id', user.id)

        // Retry the query with new token
        response = await performQuery(newAccessToken)
      }
    }

    const result = await response.json()
    if (!response.ok) {
      return NextResponse.json({ error: result.message || 'Database query failed' }, { status: response.status })
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Error in /api/database/query:', err)
    return NextResponse.json({ error: err.message || 'An unexpected error occurred.' }, { status: 500 })
  }
}
