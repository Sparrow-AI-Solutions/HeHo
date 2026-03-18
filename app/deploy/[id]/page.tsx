'use client'

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useParams } from 'next/navigation'
import { Send, Loader2, User, Bot, Globe } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Chatbot {
  id: string
  name: string
  model: string
  theme: string
  user_id: string
}

const THEMES = [
  { value: 'twilight', label: 'Twilight', color: 'bg-gradient-to-r from-slate-900 to-slate-700', textColor: 'text-white' },
  { value: 'sunrise', label: 'Sunrise', color: 'bg-gradient-to-r from-amber-300 to-orange-500', textColor: 'text-white' },
  { value: 'ocean', label: 'Ocean', color: 'bg-gradient-to-r from-cyan-500 to-blue-500', textColor: 'text-white' },
  { value: 'forest', label: 'Forest', color: 'bg-gradient-to-r from-emerald-500 to-lime-600', textColor: 'text-white' },
  { value: 'grape', label: 'Grape', color: 'bg-gradient-to-r from-violet-500 to-purple-500', textColor: 'text-white' },
  { value: 'rose', label: 'Rose', color: 'bg-gradient-to-r from-pink-500 to-rose-500', textColor: 'text-white' },
  { value: 'sky', label: 'Sky', color: 'bg-gradient-to-r from-sky-400 to-cyan-300', textColor: 'text-black' },
  { value: 'candy', label: 'Candy', color: 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400', textColor: 'text-black' },
]

export default function SharedChatbotPage() {
  const [chatbot, setChatbot] = useState<Chatbot | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const params = useParams()
  const supabase = createClient()
  const shareToken = params.id as string

  useEffect(() => {
    const fetchChatbotInfo = async () => {
      if (!shareToken) {
        setError('Share token not found.')
        setLoading(false)
        return
      }

      try {
        const { data: shareData, error: shareError } = await supabase
          .from('chatbot_shares')
          .select('chatbot_id, expires_at')
          .eq('share_token', shareToken)
          .single()

        if (shareError || !shareData) {
          setError('Invalid or expired share link.')
          setLoading(false)
          return
        }
        
        if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
            setError('This share link has expired.')
            setLoading(false)
            return
        }

        const { data: chatbotData, error: chatbotError } = await supabase
          .from('chatbots')
          .select('id, name, model, theme, user_id')
          .eq('id', shareData.chatbot_id)
          .single()

        if (chatbotError || !chatbotData) {
          setError('Chatbot not found.')
          setLoading(false)
          return
        }

        setChatbot(chatbotData)
      } catch (err) {
        console.error('Error loading shared chatbot:', err)
        setError('An unexpected error occurred.')
      } finally {
        setLoading(false)
      }
    }

    fetchChatbotInfo()
  }, [shareToken, supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || sending) return

    setSending(true)
    const currentInput = input;
    setInput('')

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
    }

    setMessages(prev => [...prev, userMessage])

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
    };
    
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbotId: chatbot!.id,
          shareToken,
          message: currentInput,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          isPublic: true,
          stream: true
        }),
      })

      if (!response.ok) throw new Error('Failed to connect');

      const reader = response.body?.getReader();
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
    } catch (error: any) {
      console.error('Chat error:', error)
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === assistantMessageId 
            ? { ...msg, content: `Sorry, an error occurred: ${error.message}` } 
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

  const selectedTheme = THEMES.find((t) => t.value === chatbot?.theme) || THEMES[0];

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#0b0b0b]">
      <Loader2 className="h-8 w-8 animate-spin text-gray-700 dark:text-gray-300" />
    </div>
  )

  if (error) return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#0b0b0b]">
      <Card className="p-8 m-4 text-center shadow-2xl rounded-3xl border-none">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">Try Again</Button>
      </Card>
    </div>
  )

  if (!chatbot) return null

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 dark:bg-[#0b0b0b] overflow-hidden relative">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0b0b0b]/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg relative`}>
              <Image
                src="/app-icon.png"
                alt="Chatbot Icon"
                fill
                className="object-contain p-1"
              />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-none">{chatbot.name}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Globe className="h-3 w-3 text-gray-500" />
              <span className="text-[10px] text-gray-500 font-medium uppercase">Public Link</span>
            </div>
          </div>
        </div>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-32 w-full scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        <div className="max-w-3xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
              <div className={`w-20 h-20 rounded-3xl mb-8 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300 relative`}>
                <Image
                  src="/app-icon.png"
                  alt="Chatbot Icon"
                  fill
                  className="object-contain p-2"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Hello there!</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-sm">
                I'm {chatbot.name}. How can I help you today?
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {messages.map(msg => (
                <div key={msg.id} className={`flex items-start gap-3 sm:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0 flex items-center justify-center shadow-sm ${
                    msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-800' : selectedTheme.color
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <Bot className={`h-4 w-4 sm:h-5 sm:w-5 ${selectedTheme.textColor}`} />
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[85%] sm:max-w-[80%] shadow-sm prose dark:prose-invert break-words text-sm sm:text-base ${
                      msg.role === 'user'
                        ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-tr-none'
                        : 'bg-white dark:bg-[#1a1a1a] text-black dark:text-white rounded-tl-none border border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    {msg.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
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
      </main>

      {/* INPUT */}
      <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 pointer-events-none">
        <div className="max-w-3xl mx-auto w-full pointer-events-auto">
          <form
            onSubmit={handleSendMessage}
            className="relative flex items-end gap-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-3xl p-2 shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.3)] transition-all focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-800"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${chatbot.name}...`}
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-3">
            <p className="text-[10px] text-gray-400 dark:text-gray-600 font-medium">
              Shift + Enter for new line • Powered by <a href="https://heho.vercel.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600 dark:hover:text-gray-400">HeHo</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
