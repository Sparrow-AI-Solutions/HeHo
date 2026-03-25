import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdminClient } from '@/lib/supabase/server'

type TelegramUpdate = {
  message?: {
    text?: string
    chat?: { id?: number }
  }
}

const parseAllowedUsers = (value: unknown): string[] => {
  if (!value) return []
  if (typeof value === 'string') {
    if (value.trim() === '*' || value.trim() === '') return []
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((id) => id.trim()).filter(Boolean)
      }
    } catch {
      // plain comma-separated value
    }
    return value.split(',').map((id) => id.trim()).filter(Boolean)
  }
  if (Array.isArray(value)) {
    return value.map(String).map((id) => id.trim()).filter(Boolean)
  }
  return []
}

async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  })
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const chatbotId = searchParams.get('chatbotId')
    const botToken = searchParams.get('token')

    if (!chatbotId || !botToken) {
      return NextResponse.json({ error: 'Missing chatbotId or token' }, { status: 400 })
    }

    const update = (await request.json()) as TelegramUpdate
    const incomingText = update?.message?.text?.trim()
    const chatId = update?.message?.chat?.id

    if (!incomingText || !chatId) {
      return NextResponse.json({ ok: true })
    }

    const supabaseAdmin = await createSupabaseAdminClient()
    const { data: chatbot } = await supabaseAdmin
      .from('chatbots')
      .select('id, telegram_id, telegram_user')
      .eq('id', chatbotId)
      .single()

    if (!chatbot || chatbot.telegram_id !== botToken) {
      return NextResponse.json({ error: 'Invalid telegram integration' }, { status: 403 })
    }

    const allowAll = !chatbot.telegram_user || String(chatbot.telegram_user).trim() === '*'
    const allowedUsers = parseAllowedUsers(chatbot.telegram_user)
    const isAllowed = allowAll || allowedUsers.includes(String(chatId))

    if (!isAllowed) {
      await sendTelegramMessage(botToken, chatId, 'You are not authorized to use this bot.')
      return NextResponse.json({ ok: true })
    }

    const chatApiRes = await fetch(`${origin}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatbotId,
        message: incomingText,
        history: [],
        isPublic: true,
      }),
    })

    const chatApiResult = await chatApiRes.json()
    const reply = chatApiResult?.reply || chatApiResult?.content || 'Thanks! I received your message.'

    await sendTelegramMessage(botToken, chatId, reply)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ error: 'Telegram webhook failed' }, { status: 500 })
  }
}

