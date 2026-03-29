import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { WAHA_API_KEY } from '@/lib/waha'

const getSessionName = (userId: string, chatbotId: string) => `user-${userId}-${String(chatbotId).slice(0, 8)}`

export async function GET(request: NextRequest) {
  try {
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
      .select('id, server_url')
      .eq('id', chatbotId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!chatbot?.id) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
    }

    if (!chatbot.server_url) {
      return NextResponse.json({ status: 'waiting_server_url', qr_url: null, server_url: null })
    }

    const sessionName = getSessionName(user.id, chatbotId)
    const statusRes = await fetch(`${chatbot.server_url}/api/sessions/${encodeURIComponent(sessionName)}`, {
      headers: {
        'X-Api-Key': WAHA_API_KEY,
      },
      cache: 'no-store',
    })

    let status = 'waiting_scan'
    if (statusRes.ok) {
      const sessionData = await statusRes.json()
      const remoteStatus = String(sessionData?.status || '').toUpperCase()
      if (remoteStatus === 'WORKING') {
        status = 'connected'
      }
    }

    const qrUrl = `${chatbot.server_url}/api/sessions/${encodeURIComponent(sessionName)}/qr`
    return NextResponse.json({
      status,
      qr_url: status === 'connected' ? null : qrUrl,
      server_url: chatbot.server_url,
      session_name: sessionName,
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch WhatsApp state' }, { status: 500 })
  }
}
