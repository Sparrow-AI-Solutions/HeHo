import { SupabaseClient } from '@supabase/supabase-js'

export interface QueryResult {
  data?: any;
  error?: string;
  status: number;
}

/**
 * Refreshes the Supabase OAuth access token if possible.
 */
async function refreshSupabaseToken(supabase: SupabaseClient, userId: string, refreshToken: string) {
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
        .eq('id', userId)

      return { accessToken: newAccessToken, refreshToken: newRefreshToken }
    } else {
      const errorText = await refreshRes.text()
      console.error('Token refresh failed:', errorText)
      return null
    }
  } catch (err) {
    console.error('Error refreshing token:', err)
    return null
  }
}

/**
 * Executes a SQL query using the Supabase Management API.
 */
export async function executeSupabaseQuery(
  supabase: SupabaseClient,
  userId: string,
  query: string,
  projectId?: string
): Promise<QueryResult> {
  try {
    // Get user's tokens and project info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('provider_token, refresh_token, supabase_url')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      console.error('Error fetching user data for query:', userError)
      return { error: 'Could not retrieve your Supabase credentials.', status: 500 }
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
      return { error: 'Project ID could not be determined.', status: 400 }
    }

    if (!accessToken) {
      return { error: 'Access token not found. Please reconnect your Supabase account.', status: 400 }
    }

    const performRequest = async (token: string) => {
      return fetch(
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
    }

    let response = await performRequest(accessToken)
    
    // Handle unauthorized (expired token)
    if (response.status === 401 && refreshToken) {
      const refreshed = await refreshSupabaseToken(supabase, userId, refreshToken)
      if (refreshed) {
        response = await performRequest(refreshed.accessToken)
      }
    }

    const responseText = await response.text()
    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      if (response.ok) {
        return { data: { message: 'Query executed successfully' }, status: response.status }
      }
      return { error: `API Error: ${response.status} - ${responseText}`, status: response.status }
    }

    if (!response.ok) {
      return { error: result.message || result.error || 'Database query failed', status: response.status }
    }

    return { data: result, status: response.status }

  } catch (err: any) {
    console.error('Error executing Supabase query:', err)
    return { error: err.message || 'An unexpected error occurred.', status: 500 }
  }
}
