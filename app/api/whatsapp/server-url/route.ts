import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

const sanitizeServerUrl = (value: string) => {
  try {
    const parsed = new URL(value.trim())
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
    parsed.hash = ''
    parsed.search = ''
    return parsed.toString().replace(/\/$/, '')
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hehoApiKey = authHeader.slice(7).trim()
    if (!hehoApiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatbotId, serverUrl } = await request.json()
    if (!chatbotId || !serverUrl) {
      return NextResponse.json({ error: 'chatbotId and serverUrl are required' }, { status: 400 })
    }

    const normalizedServerUrl = sanitizeServerUrl(String(serverUrl))
    if (!normalizedServerUrl) {
      return NextResponse.json({ error: 'Invalid server URL' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: appUser } = await admin
      .from('users')
      .select('id')
      .eq('heho_api_key', hehoApiKey)
      .maybeSingle()

    if (!appUser?.id) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { data: chatbot } = await admin
      .from('chatbots')
      .select('id')
      .eq('id', chatbotId)
      .eq('user_id', appUser.id)
      .maybeSingle()

    if (!chatbot?.id) {
      return NextResponse.json({ error: 'Chatbot not found for this API key' }, { status: 404 })
    }

    const { error: updateError } = await admin
      .from('chatbots')
      .update({ server_url: normalizedServerUrl })
      .eq('id', chatbotId)
      .eq('user_id', appUser.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, server_url: normalizedServerUrl })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to save server URL' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const chatbotId = request.nextUrl.searchParams.get('chatbotId')
  if (!chatbotId) {
    return NextResponse.json({ error: 'chatbotId is required' }, { status: 400 })
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: chatbot } = await admin
    .from('chatbots')
    .select('server_url')
    .eq('id', chatbotId)
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({ server_url: chatbot?.server_url || null })
}
