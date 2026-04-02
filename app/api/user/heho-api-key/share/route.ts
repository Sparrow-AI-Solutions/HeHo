import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_ORIGINS = new Set([
  'https://heho.vercel.app',
  'https://www.heho.vercel.app',
  'https://tfbnfg.com',
  'https://www.tfbnfg.com',
])

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  }
}

function getAllowedOrigin(req: NextRequest): string | null {
  const origin = req.headers.get('origin')
  if (!origin) return null
  return ALLOWED_ORIGINS.has(origin) ? origin : null
}

export async function OPTIONS(req: NextRequest) {
  const allowedOrigin = getAllowedOrigin(req)

  if (!allowedOrigin) {
    return NextResponse.json({ error: 'Origin not allowed.' }, { status: 403 })
  }

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(allowedOrigin),
  })
}

export async function GET(req: NextRequest) {
  const allowedOrigin = getAllowedOrigin(req)

  if (!allowedOrigin) {
    return NextResponse.json({ error: 'Origin not allowed.' }, { status: 403 })
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated.' },
        { status: 401, headers: corsHeaders(allowedOrigin) },
      )
    }

    const { data, error } = await supabase
      .from('users')
      .select('heho_api_key')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch API key.' },
        { status: 500, headers: corsHeaders(allowedOrigin) },
      )
    }

    if (!data?.heho_api_key) {
      return NextResponse.json(
        { error: 'API key not found.' },
        { status: 404, headers: corsHeaders(allowedOrigin) },
      )
    }

    return NextResponse.json(
      { hehoApiKey: data.heho_api_key },
      { status: 200, headers: corsHeaders(allowedOrigin) },
    )
  } catch {
    return NextResponse.json(
      { error: 'Unexpected server error.' },
      { status: 500, headers: corsHeaders(allowedOrigin) },
    )
  }
}
