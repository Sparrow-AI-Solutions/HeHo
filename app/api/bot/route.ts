import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdminClient } from '@/lib/supabase/server'

type TelegramUpdate = {
  message?: {
    text?: string
    chat?: { id?: number }
    from?: {
      first_name?: string
      last_name?: string
      username?: string
    }
  }
}

type ChatHistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

const MAX_HISTORY_MESSAGES = 12

declare global {
  // eslint-disable-next-line no-var
  var __telegramHistoryStore__: Map<string, ChatHistoryMessage[]> | undefined
}

const telegramHistoryStore = globalThis.__telegramHistoryStore__ || new Map<string, ChatHistoryMessage[]>()
if (!globalThis.__telegramHistoryStore__) {
  globalThis.__telegramHistoryStore__ = telegramHistoryStore
}

const getHistoryKey = (chatbotId: string, chatId: number) => `${chatbotId}:${chatId}`

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
    const senderName = [
      update?.message?.from?.first_name,
      update?.message?.from?.last_name,
    ].filter(Boolean).join(' ') || update?.message?.from?.username || 'User'

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

    const historyKey = getHistoryKey(chatbotId, chatId)
    const shouldResetHistory = incomingText.toLowerCase() === '/start'
    const existingHistory = shouldResetHistory ? [] : telegramHistoryStore.get(historyKey) || []

    if (shouldResetHistory) {
      telegramHistoryStore.delete(historyKey)
    }

    const chatApiRes = await fetch(`${origin}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatbotId,
        message: incomingText,
        history: existingHistory,
        isPublic: true,
      }),
    })

    const chatApiResult = await chatApiRes.json()
    const reply = chatApiResult?.reply || chatApiResult?.content || 'Thanks! I received your message.'

    const updatedHistory: ChatHistoryMessage[] = [
      ...existingHistory,
      { role: 'user', content: `${senderName}: ${incomingText}` },
      { role: 'assistant', content: String(reply) },
    ].slice(-MAX_HISTORY_MESSAGES)
    telegramHistoryStore.set(historyKey, updatedHistory)

    await sendTelegramMessage(botToken, chatId, reply)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ error: 'Telegram webhook failed' }, { status: 500 })
  }
}
