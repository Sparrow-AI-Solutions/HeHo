import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WAHA_URL, getWahaHeaders } from '@/lib/waha'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatbotId, number, text } = await request.json()
    if (!chatbotId || !number || !text) {
      return NextResponse.json({ error: 'chatbotId, number and text are required' }, { status: 400 })
    }

    const sessionName = `user-${user.id}-${String(chatbotId).slice(0, 8)}`
    const chatId = String(number).includes('@') ? String(number) : `${number}@c.us`

    const response = await fetch(`${WAHA_URL}/api/sendText`, {
      method: 'POST',
      headers: getWahaHeaders(),
      body: JSON.stringify({
        session: sessionName,
        chatId,
        text,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json({ error: errText || 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to send message' }, { status: 500 })
  }
}

