import { NextResponse } from 'next/server'
import { whatsappStore } from '@/lib/whatsapp-store'

export async function POST(request: Request) {
  try {
    const { chatbot_id, status } = await request.json()
    if (!chatbot_id) {
      return NextResponse.json({ error: 'chatbot_id is required' }, { status: 400 })
    }

    const nextStatus = status ? String(status) : 'connected'
    whatsappStore.status.set(String(chatbot_id), nextStatus)

    if (nextStatus === 'connected') {
      whatsappStore.qr.delete(String(chatbot_id))
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

