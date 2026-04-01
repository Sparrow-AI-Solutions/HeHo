'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Bot, Braces, Eye, Send, Sparkles, Wrench, Database, MessageSquarePlus } from 'lucide-react'

const MODEL_OPTIONS = [
  { id: 'arcee-ai/trinity-large-preview:free', name: 'Arcee AI: Trinity Large Preview' },
  { id: 'arcee-ai/trinity-mini:free', name: 'Arcee AI: Trinity Mini' },
  { id: 'qwen/qwen3-next-80b-a3b-instruct:free', name: 'Qwen 3 Next 80B Instruct' },
  { id: 'nousresearch/hermes-3-llama-3.1-405b:free', name: 'Hermes 3 Llama 3.1 405B' },
  { id: 'openrouter/hunter-alpha', name: 'OpenRouter: Hunter Alpha' },
]

const STARTER_CODE = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HeHo Generated Site</title>
    <style>
      :root { color-scheme: light dark; }
      body { margin: 0; font-family: Inter, Arial, sans-serif; background: #0b1020; color: #fff; }
      .hero { min-height: 100vh; display: grid; place-items: center; text-align: center; padding: 24px; }
      .card { max-width: 680px; border-radius: 20px; padding: 28px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.15); }
      h1 { margin: 0 0 12px; font-size: 2.4rem; }
      p { opacity: .9; line-height: 1.65; }
      button { margin-top: 18px; border: 0; padding: 12px 20px; border-radius: 999px; font-weight: 600; cursor: pointer; }
    </style>
  </head>
  <body>
    <section class="hero">
      <div class="card">
        <h1>HeHo AI Coder Workspace</h1>
        <p>Ask AI to generate a one-file HTML/CSS site, create chatbot + table requirements, and wire everything to your HeHo backend.</p>
        <button onclick="alert('Hook this CTA to your HeHo chatbot flow.')">Contact Me</button>
      </div>
    </section>
  </body>
</html>`

export default function CodeWorkspacePage() {
  const supabase = createClient()
  const [chatbots, setChatbots] = useState<Array<{ id: string; name: string }>>([])
  const [tables, setTables] = useState<string[]>([])
  const [chatbotId, setChatbotId] = useState<string>('new')
  const [tableMode, setTableMode] = useState<'existing' | 'new' | 'both'>('both')
  const [tableName, setTableName] = useState('')
  const [model, setModel] = useState(MODEL_OPTIONS[0].id)
  const [openRouterKey, setOpenRouterKey] = useState('')
  const [allowCreateChatbot, setAllowCreateChatbot] = useState(true)
  const [allowCreateTable, setAllowCreateTable] = useState(true)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'I can generate a one-file HTML/CSS site, create chatbot configs, and propose required tables from your prompt.' },
  ])
  const [messageInput, setMessageInput] = useState('Build me a SaaS landing page with a contact form and connect it to a support chatbot.')
  const [code, setCode] = useState(STARTER_CODE)

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) return

      const [{ data: bots }, { data: userTables }, { data: profile }] = await Promise.all([
        supabase.from('chatbots').select('id,name').eq('user_id', auth.user.id).order('created_at', { ascending: false }),
        supabase.from('user_connected_tables').select('table_name').eq('user_id', auth.user.id),
        supabase.from('profiles').select('openrouter_key_encrypted').eq('id', auth.user.id).single(),
      ])

      setChatbots(bots || [])
      setTables((userTables || []).map((t: any) => t.table_name))
      setOpenRouterKey(profile?.openrouter_key_encrypted || '')
    }

    load()
  }, [supabase])

  const selectedChatbot = useMemo(() => chatbots.find((bot) => bot.id === chatbotId), [chatbotId, chatbots])

  const sendMessage = () => {
    if (!messageInput.trim()) return
    setMessages((prev) => [...prev, { role: 'user', content: messageInput }])

    const response = `Planned actions:\n1) ${allowCreateChatbot ? 'Can create a new chatbot' : 'Use existing chatbot only'}\n2) ${allowCreateTable ? 'Can create new database tables' : 'Use existing tables only'}\n3) Model: ${model}\n4) Output: one-file website code + HeHo API wiring instructions.`

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', content: response }])
    }, 250)

    setMessageInput('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center gap-2"><Sparkles className="h-7 w-7" /> HeHo Code</h1>
        <p className="text-muted-foreground">Codex-style AI coder for building websites, chatbots, and table workflows powered by your OpenRouter key.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" /> AI Session Options</CardTitle>
          <CardDescription>Configure chatbot, model, and table permissions before asking AI to generate code.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Chatbot</label>
            <Select value={chatbotId} onValueChange={setChatbotId}>
              <SelectTrigger><SelectValue placeholder="Choose chatbot" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Create New Chatbot</SelectItem>
                {chatbots.map((bot) => <SelectItem key={bot.id} value={bot.id}>{bot.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MODEL_OPTIONS.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Table Mode</label>
            <Select value={tableMode} onValueChange={(v: 'existing' | 'new' | 'both') => setTableMode(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="existing">Use Existing Tables</SelectItem>
                <SelectItem value="new">Allow New Tables</SelectItem>
                <SelectItem value="both">Existing + New</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium">OpenRouter API Key</label>
            <Input value={openRouterKey} onChange={(e) => setOpenRouterKey(e.target.value)} placeholder="sk-or-v1-..." type="password" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Preferred Table</label>
            <Select value={tableName} onValueChange={setTableName}>
              <SelectTrigger><SelectValue placeholder="Select existing table" /></SelectTrigger>
              <SelectContent>
                {tables.length === 0 ? <SelectItem value="none">No tables found</SelectItem> : tables.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="allow-chatbot" checked={allowCreateChatbot} onCheckedChange={(v) => setAllowCreateChatbot(!!v)} />
            <label htmlFor="allow-chatbot" className="text-sm">Allow create chatbot</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="allow-table" checked={allowCreateTable} onCheckedChange={(v) => setAllowCreateTable(!!v)} />
            <label htmlFor="allow-table" className="text-sm">Allow create table</label>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div key={`${m.role}-${i}`} className={`rounded-2xl p-4 text-sm whitespace-pre-wrap ${m.role === 'assistant' ? 'bg-muted border' : 'bg-black text-white dark:bg-white dark:text-black ml-auto max-w-[85%]'}`}>
                <div className="flex items-center gap-2 text-xs mb-2 opacity-70">{m.role === 'assistant' ? <Bot className="h-3.5 w-3.5" /> : <MessageSquarePlus className="h-3.5 w-3.5" />}{m.role}</div>
                {m.content}
              </div>
            ))}
          </div>

          <div className="sticky bottom-2">
            <div className="rounded-3xl border bg-background shadow-xl p-2 flex items-end gap-2">
              <Textarea value={messageInput} onChange={(e) => setMessageInput(e.target.value)} className="min-h-[58px] border-0 focus-visible:ring-0" placeholder="Ask AI to build website + chatbot + tables..." />
              <Button onClick={sendMessage} className="rounded-2xl"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Braces className="h-5 w-5" /> Single-File Website Code</CardTitle>
              <CardDescription>HTML + CSS + JavaScript in one file. Ask AI to generate and update this continuously.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={code} onChange={(e) => setCode(e.target.value)} className="font-mono min-h-[60vh] text-xs" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" /> Live Preview</CardTitle>
              <CardDescription>Swipe between Chat, Code, and Preview to iterate quickly.</CardDescription>
            </CardHeader>
            <CardContent>
              <iframe title="Generated Website Preview" srcDoc={code} className="w-full h-[65vh] rounded-xl border bg-white" sandbox="allow-scripts allow-forms" />
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary"><Database className="h-3 w-3 mr-1" /> Tables API</Badge>
                <Badge variant="secondary"><Bot className="h-3 w-3 mr-1" /> Chatbot Management API</Badge>
                <Badge variant="secondary">Selected: {selectedChatbot?.name || 'Create new chatbot'}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
