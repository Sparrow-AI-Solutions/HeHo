import { NextRequest, NextResponse } from 'next/server'
import { whatsappStore } from '@/lib/whatsapp-store'
import { getUserIdFromSession, userOwnsChatbot } from '../auth'

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromSession()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const chatbotId = request.nextUrl.searchParams.get('chatbot_id')
  if (!chatbotId) {
    return NextResponse.json({ error: 'chatbot_id is required' }, { status: 400 })
  }

  const canAccess = await userOwnsChatbot(userId, chatbotId)
  if (!canAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({
    status: whatsappStore.status.get(chatbotId) || 'waiting',
  })
}
