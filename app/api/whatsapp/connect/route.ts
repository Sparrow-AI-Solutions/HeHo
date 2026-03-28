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

    const { chatbotId } = await request.json()
    if (!chatbotId) {
      return NextResponse.json({ error: 'chatbotId is required' }, { status: 400 })
    }

    const sessionName = `user-${user.id}-${String(chatbotId).slice(0, 8)}`
    const webhook = `${request.nextUrl.origin}/api/whatsapp/webhook/${user.id}?chatbotId=${encodeURIComponent(chatbotId)}`

    const createSessionRes = await fetch(`${WAHA_URL}/api/sessions`, {
      method: 'POST',
      headers: getWahaHeaders(),
      body: JSON.stringify({
        name: sessionName,
        webhook,
      }),
    })

    if (!createSessionRes.ok) {
      const text = await createSessionRes.text()
      const lowerText = text.toLowerCase()
      const alreadyExists = lowerText.includes('already') && lowerText.includes('exist')

      if (!alreadyExists) {
        return NextResponse.json({ error: `Failed to create WAHA session: ${text}` }, { status: 500 })
      }
    }

    const qrUrl = `${WAHA_URL}/api/sessions/${encodeURIComponent(sessionName)}/qr`
    return NextResponse.json({ sessionName, qrUrl })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to connect WhatsApp' }, { status: 500 })
  }
}
