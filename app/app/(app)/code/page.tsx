'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Bot, Braces, Eye, Send, Sparkles, Database, MessageSquarePlus, Shield, Settings2, Loader2 } from 'lucide-react'

const MODEL_OPTIONS = [
  { id: 'arcee-ai/trinity-large-preview:free', name: 'Arcee Trinity Large' },
  { id: 'arcee-ai/trinity-mini:free', name: 'Arcee Trinity Mini' },
  { id: 'qwen/qwen3-next-80b-a3b-instruct:free', name: 'Qwen 3 Next 80B' },
  { id: 'nousresearch/hermes-3-llama-3.1-405b:free', name: 'Hermes 3 405B' },
]

const STARTER_CODE = `<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Beach Preview</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, Arial, sans-serif; background: linear-gradient(#a7e1ff,#f8e6be); color: #10233f; }
    .sun { width: 120px; height: 120px; border-radius: 50%; background: #ffd87a; filter: blur(2px); margin: 30px auto; }
    .card { width: min(760px, calc(100vw - 32px)); margin: 0 auto; background: rgba(255,255,255,.75); border: 1px solid rgba(0,0,0,.08); border-radius: 22px; padding: 24px; }
    h1 { margin: 8px 0; font-size: 42px; }
    p { color: #31557c; line-height: 1.6; }
    button { border: 0; border-radius: 999px; padding: 12px 20px; background: #0f7ddf; color: #fff; font-weight: 600; }
  </style>
</head>
<body>
  <div class="sun"></div>
  <section class="card">
    <h1>Connect to HeHo API</h1>
    <p>Preview area for your generated one-file website. ARAS updates this live from the Code tab.</p>
    <button>Verify & Connect</button>
  </section>
</body>
</html>`

type Message = { role: 'assistant' | 'user'; content: string }

export default function CodeWorkspacePage() {
  const supabase = createClient()
  const [chatbots, setChatbots] = useState<Array<{ id: string; name: string }>>([])
  const [tables, setTables] = useState<string[]>([])
  const [chatbotId, setChatbotId] = useState<string>('new')
  const [tableName, setTableName] = useState('new')
  const [model, setModel] = useState(MODEL_OPTIONS[0].id)
  const [secretMode, setSecretMode] = useState(true)
  const [allowNewChatbot, setAllowNewChatbot] = useState(true)
  const [allowNewTable, setAllowNewTable] = useState(false)
  const [tab, setTab] = useState<'chat' | 'preview' | 'code'>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [working, setWorking] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [code, setCode] = useState(STARTER_CODE)

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) return

      const [{ data: bots }, { data: userTables }] = await Promise.all([
        supabase.from('chatbots').select('id,name').eq('user_id', auth.user.id).order('created_at', { ascending: false }),
        supabase.from('user_connected_tables').select('table_name').eq('user_id', auth.user.id),
      ])

      setChatbots(bots || [])
      setTables((userTables || []).map((t: { table_name: string }) => t.table_name))
    }

    load()
  }, [supabase])

  const selectedChatbot = useMemo(() => chatbots.find((bot) => bot.id === chatbotId), [chatbots, chatbotId])


  const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 12000) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(url, { ...options, signal: controller.signal })
    } finally {
      clearTimeout(timer)
    }
  }

  const sendMessage = async () => {
    if (!messageInput.trim() || working) return
    const prompt = messageInput.trim()
    setMessages((prev) => [...prev, { role: 'user', content: prompt }])
    setWorking(true)

    let assistantReply = ''
    let nextCode = code

    if (prompt.toLowerCase().includes('contact') && !code.includes('<form')) {
      nextCode = code.replace('</section>\n</body>', `<form style="margin-top:16px;display:grid;gap:8px;">\n      <input placeholder="Name" style="padding:10px;border-radius:10px;border:1px solid #d8e2ec;"/>\n      <input placeholder="Email" style="padding:10px;border-radius:10px;border:1px solid #d8e2ec;"/>\n      <textarea placeholder="Message" style="padding:10px;border-radius:10px;border:1px solid #d8e2ec;"></textarea>\n      <button type="button">Send</button>\n    </form>\n  </section>\n</body>`)
    }

    if (prompt.toLowerCase().includes('dark')) {
      nextCode = nextCode.replace('linear-gradient(#a7e1ff,#f8e6be)', 'linear-gradient(#0a0f1f,#1b1f2f)')
    }

    if (chatbotId !== 'new') {
      try {
        const res = await fetchWithTimeout('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatbotId,
            message: prompt,
            history: messages.map((m) => ({ role: m.role, content: m.content })),
            stream: false,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          assistantReply = data.response || data.message || 'Connected chatbot replied successfully.'
        } else {
          assistantReply = 'Selected chatbot is unavailable right now. I switched to local ARAS coding mode.'
        }
      } catch {
        assistantReply = 'Chatbot call timed out. I switched to local ARAS coding mode so you can continue.'
      }
    }

    if (!assistantReply) {
      assistantReply = [
        `${secretMode ? 'Secret Mode' : 'Standard Mode'} complete.`,
        `Model: ${MODEL_OPTIONS.find((m) => m.id === model)?.name || model}`,
        `Chatbot: ${selectedChatbot?.name || (allowNewChatbot ? 'New chatbot can be created' : 'Select existing chatbot')}`,
        `Database table: ${tableName === 'new' ? (allowNewTable ? 'New table allowed' : 'Select existing table') : tableName}`,
        nextCode !== code ? 'Code updated and synced to preview.' : 'No code change yet. Ask for exact edits.',
      ].join('\n')
    }

    if (nextCode !== code) setCode(nextCode)
    setMessages((prev) => [...prev, { role: 'assistant', content: assistantReply }])
    setMessageInput('')
    setWorking(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 pb-6">
      <Card className="overflow-hidden border-border/70">
        <CardContent className="p-0">
          <div className="p-4 border-b bg-card">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h1 className="text-xl font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4" /> ARAS</h1>
              <div className="flex items-center gap-2">
                <Button variant={secretMode ? 'default' : 'outline'} size="sm" onClick={() => setSecretMode((v) => !v)} className="rounded-full gap-2">
                  <Shield className="h-3.5 w-3.5" /> Secret Mode
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full"><Settings2 className="h-4 w-4" /></Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-64 space-y-3">
                    <p className="text-sm font-medium">ARAS Options</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>Allow new chatbot</span>
                      <Checkbox checked={allowNewChatbot} onCheckedChange={(v) => setAllowNewChatbot(!!v)} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Allow new table</span>
                      <Checkbox checked={allowNewTable} onCheckedChange={(v) => setAllowNewTable(!!v)} />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select value={chatbotId} onValueChange={setChatbotId}>
                <SelectTrigger><SelectValue placeholder="Select chatbot" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New chatbot</SelectItem>
                  {chatbots.map((bot) => <SelectItem key={bot.id} value={bot.id}>{bot.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={tableName} onValueChange={setTableName}>
                <SelectTrigger><SelectValue placeholder="Select table" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New table</SelectItem>
                  {tables.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as 'chat' | 'preview' | 'code')} className="w-full">
            <div className="border-b p-3 space-y-2">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
              </TabsList>
              <p className="text-xs text-muted-foreground">One tab visible at a time for cleaner mobile workflow.</p>
            </div>

            <TabsContent value="chat" className="m-0 min-h-[58vh] flex flex-col">
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">What can I build for you?</h2>
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <div key={`${m.role}-${i}`} className={`rounded-2xl p-3 text-sm whitespace-pre-wrap ${m.role === 'assistant' ? 'bg-muted border mr-10' : 'bg-primary text-primary-foreground ml-10'}`}>
                      <div className="text-xs mb-1 opacity-80 flex items-center gap-1">{m.role === 'assistant' ? <Bot className="h-3.5 w-3.5" /> : <MessageSquarePlus className="h-3.5 w-3.5" />}{m.role === 'assistant' ? 'ARAS' : 'You'}</div>
                      {m.content}
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 border-t">
                <div className="rounded-3xl border bg-background p-2 shadow-sm flex items-end gap-2">
                  <Textarea value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Assign task or ask anything..." className="min-h-[72px] border-0 focus-visible:ring-0" />
                  <Button onClick={sendMessage} size="icon" disabled={working || !messageInput.trim()} className="rounded-2xl h-10 w-10">
                    {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="m-0 h-[62vh] sm:h-[68vh] border-t">
              <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                <Badge variant="secondary"><Database className="h-3 w-3 mr-1" /> Live website preview</Badge>
              </div>
              <iframe title="Website Preview" srcDoc={code} className="w-full h-[calc(62vh-53px)] sm:h-[calc(68vh-53px)] border-0 bg-white" sandbox="allow-scripts allow-forms" />
            </TabsContent>

            <TabsContent value="code" className="m-0 h-[62vh] sm:h-[68vh] border-t">
              <Textarea value={code} onChange={(e) => setCode(e.target.value)} className="h-full min-h-full resize-none rounded-none border-0 font-mono text-xs" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
