import { NextResponse } from 'next/server'
import { whatsappStore } from '@/lib/whatsapp-store'

export async function POST(request: Request) {
  try {
    const { chatbot_id, qr } = await request.json()
    if (!chatbot_id || !qr) {
      return NextResponse.json({ error: 'chatbot_id and qr are required' }, { status: 400 })
    }

    whatsappStore.qr.set(String(chatbot_id), String(qr))
    whatsappStore.status.set(String(chatbot_id), 'waiting_scan')

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

