'use client'

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useRouter, useParams } from "next/navigation"
import { Send, Loader2, ArrowLeft, Settings, Rocket } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/* ================= TYPES ================= */

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Chatbot {
  id: string
  name: string
  model: string
  theme: string
}

interface Usage {
  messages: number
  tokens: number
}

/* ================= CONSTANTS ================= */

const MESSAGE_LIMIT = 100
const TOKEN_LIMIT = 250000

const THEMES = [
  { value: 'twilight', color: 'bg-gradient-to-r from-slate-900 to-slate-700', textColor: 'text-white' },
  { value: 'sunrise', color: 'bg-gradient-to-r from-amber-300 to-orange-500', textColor: 'text-white' },
  { value: 'ocean', color: 'bg-gradient-to-r from-cyan-500 to-blue-500', textColor: 'text-white' },
  { value: 'forest', color: 'bg-gradient-to-r from-emerald-500 to-lime-600', textColor: 'text-white' },
  { value: 'grape', color: 'bg-gradient-to-r from-violet-500 to-purple-500', textColor: 'text-white' },
  { value: 'rose', color: 'bg-gradient-to-r from-pink-500 to-rose-500', textColor: 'text-white' },
  { value: 'sky', color: 'bg-gradient-to-r from-sky-400 to-cyan-300', textColor: 'text-black' },
  { value: 'candy', color: 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400', textColor: 'text-black' },
]

/* ================= PAGE ================= */

export default function ChatbotPage() {
  const [chatbot, setChatbot] = useState<Chatbot | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [usage, setUsage] = useState<Usage>({ messages: 0, tokens: 0 })
  const [limitReached, setLimitReached] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const chatbotId = params.id as string

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return router.push("/login")

        const { data } = await supabase
          .from("chatbots")
          .select("id, name, model, theme")
          .eq("id", chatbotId)
          .eq("user_id", user.id)
          .single()

        if (!data) return router.push("/app/dashboard")
        setChatbot(data)
      } catch {
        router.push("/app/dashboard")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [chatbotId, router, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  /* ================= SEND MESSAGE ================= */

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || limitReached || sending) return

    setSending(true)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatbotId, message: input, history: messages }),
      })

      const { reply } = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: reply,
          timestamp: new Date(),
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedTheme =
    THEMES.find((t) => t.value === chatbot?.theme) || THEMES[0]

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-black dark:text-white" />
      </div>
    )
  }

  if (!chatbot) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-black">
        <Card className="p-6 text-black dark:text-white">Chatbot not found</Card>
      </div>
    )
  }

  /* ================= UI ================= */

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-black overflow-hidden relative">

      {/* HEADER – STICKY */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-3 sm:p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/app/chatbots">
            <Button variant="ghost" size="icon" className="text-black dark:text-white h-8 w-8 sm:h-10 sm:w-10">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-sm sm:text-base text-black dark:text-white truncate max-w-[150px] sm:max-w-none">
            {chatbot.name}
          </h1>
        </div>

        <div className="flex gap-1 sm:gap-2">
          <Link href={`/app/chatbots/${chatbot.id}/settings?tab=config`}>
            <Button variant="outline" size="icon" className="text-black dark:text-white h-8 w-8 sm:h-10 sm:w-10">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <Link href={`/app/chatbots/${chatbot.id}/settings?tab=deploy`}>
            <Button variant="outline" size="icon" className="text-black dark:text-white h-8 w-8 sm:h-10 sm:w-10">
              <Rocket className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* CHAT SCROLL AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32 w-full">
        <div className="max-w-3xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center px-4">
              <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${selectedTheme.color} shadow-lg`}>
                <span className={`text-2xl font-bold ${selectedTheme.textColor}`}>
                  {chatbot.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-2">
                Hello! I'm {chatbot.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                How can I help you today? Send a message to start our conversation.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[85%] sm:max-w-[75%] shadow-sm prose dark:prose-invert break-words ${
                      m.role === "user"
                        ? `${selectedTheme.color} ${selectedTheme.textColor} rounded-br-none`
                        : "bg-gray-100 dark:bg-gray-900 text-black dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-200 dark:border-gray-800">
                    <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* FLOATING INPUT */}
      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 pointer-events-none">
        <div className="max-w-3xl mx-auto w-full pointer-events-auto">
          <form
            onSubmit={handleSendMessage}
            className="relative flex items-end gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-2 shadow-2xl transition-all focus-within:border-gray-400 dark:focus-within:border-gray-600"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={sending}
              rows={1}
              className="flex-1 min-h-[44px] max-h-[200px] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none py-3 px-3 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <Button 
              type="submit" 
              disabled={sending || !input.trim()}
              size="icon"
              className={`h-10 w-10 rounded-xl shrink-0 mb-0.5 transition-all ${
                input.trim() ? selectedTheme.color + ' ' + selectedTheme.textColor : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}
            >
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
          <p className="text-[10px] text-center text-gray-400 dark:text-gray-600 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
