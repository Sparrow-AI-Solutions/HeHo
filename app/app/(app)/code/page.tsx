'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Bot, Braces, Eye, Send, Sparkles, Database, MessageSquarePlus, PanelLeft, KeyRound } from 'lucide-react'

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
  <title>ARAS Site</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, Arial, sans-serif; background: #0b1020; color: #fff; }
    .wrap { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
    .card { max-width: 720px; border-radius: 20px; padding: 30px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.15); }
    h1 { margin-top: 0; }
    input, textarea { width: 100%; margin: 8px 0; padding: 10px; border-radius: 10px; border: 1px solid #2f3a61; background: #101935; color: #fff; }
    button { border: 0; padding: 12px 20px; border-radius: 999px; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <section class="wrap">
    <div class="card">
      <h1>ARAS AI Website</h1>
      <p>This is your single-file website workspace powered by HeHo + OpenRouter.</p>
    </div>
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
  const [openRouterKey, setOpenRouterKey] = useState('')
  const [allowNewTable, setAllowNewTable] = useState(true)
  const [allowNewChatbot, setAllowNewChatbot] = useState(true)
  const [chatMode, setChatMode] = useState<'build' | 'edit'>('build')
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('preview')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi, I am ARAS. I can build and re-edit your one-file website, then tell you chatbot + table steps for HeHo.' },
  ])
  const [messageInput, setMessageInput] = useState('Create a modern landing page with a contact form and explain required chatbot/table setup.')
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
      setTables((userTables || []).map((t: { table_name: string }) => t.table_name))
      setOpenRouterKey(profile?.openrouter_key_encrypted || '')
    }

    load()
  }, [supabase])

  const selectedChatbot = useMemo(() => chatbots.find((bot) => bot.id === chatbotId), [chatbots, chatbotId])

  const sendMessage = () => {
    if (!messageInput.trim()) return
    const prompt = messageInput.trim()
    setMessages((prev) => [...prev, { role: 'user', content: prompt }])

    let nextCode = code
    const lower = prompt.toLowerCase()

    if (lower.includes('contact form') && !code.includes('<form')) {
      nextCode = code.replace('</div>\n  </section>', `<form onsubmit="event.preventDefault(); alert('Submit this to your HeHo chatbot flow/API.');">\n        <input placeholder="Your name" />\n        <input type="email" placeholder="Your email" />\n        <textarea placeholder="How can we help?"></textarea>\n        <button type="submit">Send</button>\n      </form>\n    </div>\n  </section>`)
    }

    if (lower.includes('pricing') && !code.includes('Pricing')) {
      nextCode = nextCode.replace('</section>\n</body>', '</section>\n  <section style="padding:24px;text-align:center;"><h2>Pricing</h2><p>Starter, Growth, Enterprise</p></section>\n</body>')
    }

    if (nextCode !== code) {
      setCode(nextCode)
    }

    const reply = [
      `ARAS plan (${chatMode} mode):`,
      `• Model: ${model}`,
      `• Chatbot: ${selectedChatbot?.name || (allowNewChatbot ? 'Create new chatbot' : 'Use existing only')}`,
      `• Database: ${tableName === 'new' ? (allowNewTable ? 'Create new table allowed' : 'Pick existing table') : `Use existing table: ${tableName}`}`,
      `• OpenRouter key loaded: ${openRouterKey ? 'Yes' : 'No (add key in side panel)'}`,
      nextCode !== code
        ? '• I updated the code in the Code tab based on your request.'
        : '• I analyzed current code and gave workflow guidance. Ask for specific UI blocks to auto-edit.',
    ].join('\n')

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    }, 250)

    setMessageInput('')
  }

  return (
    <div className="h-[calc(100vh-7rem)] max-w-[1400px] mx-auto px-4 sm:px-6 pb-6">
      <div className="h-full grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-4">
        <Card className="h-full flex flex-col overflow-hidden">
          <div className="border-b p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4" /> ARAS Code Assistant</h1>
              <Badge variant="secondary">ChatGPT-style</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="allow-new-table" checked={allowNewTable} onCheckedChange={(v) => setAllowNewTable(!!v)} />
              <label htmlFor="allow-new-table" className="text-sm">Allow new table</label>
            </div>
          </div>

          <div className="p-4 border-b space-y-3 bg-muted/20">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Chatbot</label>
              <Select value={chatbotId} onValueChange={setChatbotId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Create New Chatbot</SelectItem>
                  {chatbots.map((bot) => <SelectItem key={bot.id} value={bot.id}>{bot.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Database Table</label>
              <Select value={tableName} onValueChange={setTableName}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Create New Table Label</SelectItem>
                  {tables.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant={chatMode === 'build' ? 'default' : 'outline'} onClick={() => setChatMode('build')} className="w-full">Build Mode</Button>
              <Button variant={chatMode === 'edit' ? 'default' : 'outline'} onClick={() => setChatMode('edit')} className="w-full">Edit Mode</Button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Model</label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground flex items-center gap-1"><KeyRound className="h-3 w-3" /> OpenRouter Key</label>
              <Input type="password" value={openRouterKey} onChange={(e) => setOpenRouterKey(e.target.value)} placeholder="sk-or-v1-..." />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="allow-new-chatbot" checked={allowNewChatbot} onCheckedChange={(v) => setAllowNewChatbot(!!v)} />
              <label htmlFor="allow-new-chatbot" className="text-sm">Allow new chatbot</label>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={`${m.role}-${i}`} className={`rounded-2xl p-3 text-sm whitespace-pre-wrap ${m.role === 'assistant' ? 'bg-muted border mr-6' : 'bg-black text-white dark:bg-white dark:text-black ml-6'}`}>
                <div className="text-xs mb-1 opacity-70 flex items-center gap-1">{m.role === 'assistant' ? <Bot className="h-3.5 w-3.5" /> : <MessageSquarePlus className="h-3.5 w-3.5" />}{m.role === 'assistant' ? 'ARAS' : 'You'}</div>
                {m.content}
              </div>
            ))}
          </div>

          <div className="p-3 border-t bg-background sticky bottom-0">
            <div className="rounded-2xl border p-2 flex items-end gap-2 shadow-sm">
              <Textarea value={messageInput} onChange={(e) => setMessageInput(e.target.value)} className="min-h-[64px] border-0 focus-visible:ring-0" placeholder="Tell ARAS what to build or re-edit in this same code..." />
              <div className="flex flex-col gap-2">
                <Badge variant="outline" className="max-w-[120px] truncate"><Database className="h-3 w-3 mr-1" /> {tableName === 'new' ? 'new table' : tableName}</Badge>
                <Button onClick={sendMessage} size="icon" className="rounded-xl"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="h-full overflow-hidden">
          <CardContent className="h-full p-0 flex flex-col">
            <div className="border-b p-3 flex items-center justify-between">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'code' | 'preview')}>
                <TabsList>
                  <TabsTrigger value="code" className="gap-2"><Braces className="h-4 w-4" /> Code</TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2"><Eye className="h-4 w-4" /> Preview</TabsTrigger>
                </TabsList>
              </Tabs>
              <Badge variant="secondary" className="hidden sm:inline-flex"><PanelLeft className="h-3 w-3 mr-1" /> Full Preview Space</Badge>
            </div>

            <div className="flex-1 min-h-0">
              {activeTab === 'code' ? (
                <Textarea value={code} onChange={(e) => setCode(e.target.value)} className="h-full min-h-full resize-none rounded-none border-0 font-mono text-xs" />
              ) : (
                <iframe title="Website Preview" srcDoc={code} className="w-full h-full border-0 bg-white" sandbox="allow-scripts allow-forms" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
