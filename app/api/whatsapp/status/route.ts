import { NextRequest, NextResponse } from 'next/server'
import { whatsappStore } from '@/lib/whatsapp-store'

export async function GET(request: NextRequest) {
  const chatbotId = request.nextUrl.searchParams.get('chatbot_id')
  if (!chatbotId) {
    return NextResponse.json({ error: 'chatbot_id is required' }, { status: 400 })
  }

  return NextResponse.json({
    status: whatsappStore.status.get(chatbotId) || 'waiting',
  })
}

