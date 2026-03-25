import { NextResponse } from 'next/server'
import { whatsappStore } from '@/lib/whatsapp-store'
import { getUserIdFromBearer, userOwnsChatbot } from '../auth'

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromBearer(request.headers.get('authorization'))
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatbot_id } = await request.json()
    if (!chatbot_id) {
      return NextResponse.json({ error: 'chatbot_id is required' }, { status: 400 })
    }

    const canAccess = await userOwnsChatbot(userId, String(chatbot_id))
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    whatsappStore.status.set(String(chatbot_id), 'deployed')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
