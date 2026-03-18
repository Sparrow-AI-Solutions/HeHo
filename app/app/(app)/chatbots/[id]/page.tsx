'use client'

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useRouter, useParams } from "next/navigation"
import { Send, Loader2, ArrowLeft, Settings, Rocket, User, Bot } from "lucide-react"
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

/* ================= CONSTANTS ================= */

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
    if (!input.trim() || sending) return

    setSending(true)
    const currentInput = input;
    setInput("")

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: currentInput,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          chatbotId, 
          message: currentInput, 
          history: messages.map(m => ({ role: m.role, content: m.content })),
          stream: true 
        }),
      })

      if (!res.ok) throw new Error("Failed to connect");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  accumulatedContent += data.content;
                  setMessages((prev) => 
                    prev.map((msg) => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: accumulatedContent } 
                        : msg
                    )
                  );
                }
              } catch (e) {
                // Ignore parse errors for partial chunks
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === assistantMessageId 
            ? { ...msg, content: "Sorry, I encountered an error. Please try again." } 
            : msg
        )
      );
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
    <div className="h-screen flex flex-col bg-white dark:bg-[#0b0b0b] overflow-hidden relative">
      
      {/* HEADER – STICKY */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#0b0b0b]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-3 sm:p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/app/chatbots">
            <Button variant="ghost" size="icon" className="text-black dark:text-white h-8 w-8 sm:h-10 sm:w-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="font-bold text-sm sm:text-base text-black dark:text-white truncate max-w-[150px] sm:max-w-none leading-none">
              {chatbot.name}
            </h1>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Online</span>
          </div>
        </div>

        <div className="flex gap-1 sm:gap-2">
          <Link href={`/app/chatbots/${chatbot.id}/settings?tab=config`}>
            <Button variant="ghost" size="icon" className="text-black dark:text-white h-8 w-8 sm:h-10 sm:w-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <Link href={`/app/chatbots/${chatbot.id}/settings?tab=deploy`}>
            <Button variant="ghost" size="icon" className="text-black dark:text-white h-8 w-8 sm:h-10 sm:w-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <Rocket className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* CHAT SCROLL AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32 w-full scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        <div className="max-w-3xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center px-4">
              <div className={`w-20 h-20 rounded-3xl mb-6 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300 relative`}>
                <Image
                  src="/app-icon.png"
                  alt="Chatbot Icon"
                  fill
                  className="object-contain p-2"
                />
              </div>
              <h2 className="text-3xl font-bold text-black dark:text-white mb-3">
                How can I help you?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm text-lg">
                I'm {chatbot.name}, your AI assistant. Ask me anything to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 sm:gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0 flex items-center justify-center shadow-sm ${
                    m.role === "user" ? "bg-gray-200 dark:bg-gray-800" : selectedTheme.color
                  }`}>
                    {m.role === "user" ? (
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <Bot className={`h-4 w-4 sm:h-5 sm:w-5 ${selectedTheme.textColor}`} />
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[85%] sm:max-w-[80%] shadow-sm prose dark:prose-invert break-words text-sm sm:text-base ${
                      m.role === "user"
                        ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-tr-none"
                        : "bg-white dark:bg-[#1a1a1a] text-black dark:text-white rounded-tl-none border border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    {m.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    ) : (
                      <div className="flex gap-1 py-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>
      </div>

      {/* FLOATING INPUT */}
      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 pointer-events-none">
        <div className="max-w-3xl mx-auto w-full pointer-events-auto">
          <form
            onSubmit={handleSendMessage}
            className="relative flex items-end gap-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-3xl p-2 shadow-[0_0_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.3)] transition-all focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-800"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={sending}
              rows={1}
              className="flex-1 min-h-[44px] max-h-[200px] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none py-3 px-4 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm sm:text-base"
            />
            <Button 
              type="submit" 
              disabled={sending || !input.trim()}
              size="icon"
              className={`h-10 w-10 rounded-2xl shrink-0 mb-0.5 transition-all duration-300 ${
                input.trim() ? selectedTheme.color + ' ' + selectedTheme.textColor + ' shadow-lg scale-100' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 scale-90'
              }`}
            >
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
          <p className="text-[10px] text-center text-gray-400 dark:text-gray-600 mt-3 font-medium">
            Shift + Enter for new line • {chatbot.name} is powered by HeHo
          </p>
        </div>
      </div>
    </div>
  )
}
