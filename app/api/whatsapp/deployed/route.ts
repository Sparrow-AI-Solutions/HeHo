import { NextResponse } from 'next/server'
import { whatsappStore } from '@/lib/whatsapp-store'

export async function POST(request: Request) {
  try {
    const { chatbot_id } = await request.json()
    if (!chatbot_id) {
      return NextResponse.json({ error: 'chatbot_id is required' }, { status: 400 })
    }

    whatsappStore.status.set(String(chatbot_id), 'deployed')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

