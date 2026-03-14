import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
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
      console.error('Error fetching user data:', userError)
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

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token not found. Please reconnect your Supabase account.' }, { status: 400 })
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

    let response = await performQuery(accessToken)
    let responseText = await response.text()

    // If unauthorized, try to refresh the token
    if (response.status === 401 && refreshToken) {
      console.log('Token expired, attempting refresh...')
      try {
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
          const newRefreshToken = refreshData.refresh_token || refreshToken

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
          responseText = await response.text()
        } else {
          const refreshError = await refreshRes.text()
          console.error('Token refresh failed:', refreshError)
          return NextResponse.json({ error: 'Token refresh failed. Please reconnect your Supabase account.' }, { status: 401 })
        }
      } catch (refreshErr: any) {
        console.error('Error during token refresh:', refreshErr)
        return NextResponse.json({ error: 'Failed to refresh token.' }, { status: 500 })
      }
    }

    // Parse response
    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseErr) {
      console.error('Failed to parse response:', responseText)
      if (!response.ok) {
        return NextResponse.json({ error: `API Error: ${response.status} - ${responseText}` }, { status: response.status })
      }
      // If response is ok but not JSON, return success
      result = { message: 'Query executed successfully' }
    }

    if (!response.ok) {
      const errorMsg = result?.message || result?.error || 'Database query failed'
      return NextResponse.json({ error: errorMsg }, { status: response.status })
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Error in /api/database/query:', err)
    return NextResponse.json({ error: err.message || 'An unexpected error occurred.' }, { status: 500 })
  }
}
