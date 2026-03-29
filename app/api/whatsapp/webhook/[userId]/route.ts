import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@/lib/supabase/admin'
import { WAHA_URL, getWahaHeaders } from '@/lib/waha'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const chatbotId = request.nextUrl.searchParams.get('chatbotId')
    if (!chatbotId) {
      return NextResponse.json({ error: 'chatbotId is required' }, { status: 400 })
    }

    const userId = params.userId
    const payload = await request.json()
    const messageText = payload?.body || payload?.text || payload?.message?.text || ''
    const from = payload?.from || payload?.chatId || payload?.chat?.id
    if (!messageText || !from) {
      return NextResponse.json({ ok: true })
    }

    const admin = createAdminClient()
    const { data: chatbot } = await admin
      .from('chatbots')
      .select('id')
      .eq('id', chatbotId)
      .eq('user_id', userId)
      .maybeSingle()

    if (!chatbot) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const appChatRes = await fetch(`${request.nextUrl.origin}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatbotId,
        message: messageText,
        history: [],
        isPublic: true,
      }),
    })

    const appChatData = await appChatRes.json()
    const reply = appChatData?.reply || appChatData?.content || `You said: ${messageText}`

    await sleep(3000)

    const sessionName = `user-${userId}-${String(chatbotId).slice(0, 8)}`
    await fetch(`${WAHA_URL}/api/sendText`, {
      method: 'POST',
      headers: getWahaHeaders(),
      body: JSON.stringify({
        session: sessionName,
        chatId: from,
        text: reply,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Webhook failed' }, { status: 500 })
  }
}

