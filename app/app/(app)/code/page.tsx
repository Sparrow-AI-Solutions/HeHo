'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Bot, Braces, Eye, Send, Sparkles, Database, MessageSquarePlus, Shield, CheckCircle2, Loader2 } from 'lucide-react'

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
type Task = { id: string; label: string; status: 'running' | 'done' }

export default function CodeWorkspacePage() {
  const supabase = createClient()
  const [chatbots, setChatbots] = useState<Array<{ id: string; name: string }>>([])
  const [tables, setTables] = useState<string[]>([])
  const [chatbotId, setChatbotId] = useState<string>('new')
  const [tableName, setTableName] = useState('new')
  const [model, setModel] = useState(MODEL_OPTIONS[0].id)
  const [secretMode, setSecretMode] = useState(true)
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('preview')
  const [messages, setMessages] = useState<Message[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
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

  const runTaskAnimation = async (items: string[]) => {
    const initial = items.map((label, idx) => ({ id: `${Date.now()}-${idx}`, label, status: (idx === 0 ? 'running' : 'done') as 'running' | 'done' }))
    setTasks(initial)
    for (let i = 0; i < initial.length; i += 1) {
      setTasks((prev) => prev.map((t, idx) => {
        if (idx < i) return { ...t, status: 'done' }
        if (idx === i) return { ...t, status: 'running' }
        return t
      }))
      await new Promise((r) => setTimeout(r, 550))
    }
    setTasks((prev) => prev.map((t) => ({ ...t, status: 'done' })))
  }

  const sendMessage = async () => {
    if (!messageInput.trim() || working) return
    const prompt = messageInput.trim()
    setMessages((prev) => [...prev, { role: 'user', content: prompt }])
    setWorking(true)

    await runTaskAnimation([
      'Analyze request',
      'Generate / edit single-file website',
      'Plan chatbot + table linkage',
      'Return summary and updated output',
    ])

    let nextCode = code
    const lower = prompt.toLowerCase()

    if (lower.includes('contact') && !code.includes('<form')) {
      nextCode = code.replace('</section>\n</body>', `<form style="margin-top:16px;display:grid;gap:8px;">\n      <input placeholder="Name" style="padding:10px;border-radius:10px;border:1px solid #d8e2ec;"/>\n      <input placeholder="Email" style="padding:10px;border-radius:10px;border:1px solid #d8e2ec;"/>\n      <textarea placeholder="Message" style="padding:10px;border-radius:10px;border:1px solid #d8e2ec;"></textarea>\n      <button type="button">Send</button>\n    </form>\n  </section>\n</body>`)
    }

    if (lower.includes('dark')) {
      nextCode = nextCode.replace('linear-gradient(#a7e1ff,#f8e6be)', 'linear-gradient(#0a0f1f,#1b1f2f)')
    }

    if (nextCode !== code) setCode(nextCode)

    const reply = [
      `ARAS ${secretMode ? 'Secret Mode' : 'Standard Mode'} complete.`,
      `Model: ${MODEL_OPTIONS.find((m) => m.id === model)?.name || model}`,
      `Chatbot: ${selectedChatbot?.name || 'Create new chatbot'}`,
      `Database: ${tableName === 'new' ? 'Create new table label' : tableName}`,
      nextCode !== code ? 'I updated the code and synced preview.' : 'No code changes yet; ask for exact section edits.',
    ].join('\n')

    setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    setMessageInput('')
    setWorking(false)
  }

  const showWelcome = messages.length === 0

  return (
    <div className="h-[calc(100vh-7rem)] max-w-[1450px] mx-auto px-4 sm:px-6 pb-6">
      <div className="h-full grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-4">
        <Card className="h-full flex flex-col overflow-hidden border-border/70">
          <div className="border-b p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4" /> ARAS</h1>
              <Button variant={secretMode ? 'default' : 'outline'} size="sm" onClick={() => setSecretMode((v) => !v)} className="rounded-full gap-2">
                <Shield className="h-3.5 w-3.5" /> {secretMode ? 'Secret Mode' : 'Standard'}
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Select value={chatbotId} onValueChange={setChatbotId}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Chatbot" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New chatbot</SelectItem>
                  {chatbots.map((bot) => <SelectItem key={bot.id} value={bot.id}>{bot.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={tableName} onValueChange={setTableName}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Table" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New table</SelectItem>
                  {tables.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {showWelcome ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-2">
                <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">Top {secretMode ? 'Secret' : 'Standard'} mode ready</Badge>
                <h2 className="text-4xl font-semibold tracking-tight">What can I build for you?</h2>
                <p className="text-muted-foreground mt-3 max-w-sm">Ask ARAS to generate or re-edit the same one-file website and connect chatbot + database flow.</p>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={`${m.role}-${i}`} className={`rounded-2xl p-3 text-sm whitespace-pre-wrap ${m.role === 'assistant' ? 'bg-muted border mr-8' : 'bg-primary text-primary-foreground ml-8'}`}>
                    <div className="text-xs mb-1 opacity-80 flex items-center gap-1">{m.role === 'assistant' ? <Bot className="h-3.5 w-3.5" /> : <MessageSquarePlus className="h-3.5 w-3.5" />}{m.role === 'assistant' ? 'ARAS' : 'You'}</div>
                    {m.content}
                  </div>
                ))}

                {tasks.length > 0 && (
                  <div className="rounded-2xl border bg-muted/40 p-3 space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Task flow</p>
                    {tasks.map((t) => (
                      <div key={t.id} className="flex items-center gap-2 text-sm rounded-xl bg-background/80 border px-3 py-2">
                        {t.status === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        <span>{t.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t p-3">
            <div className="rounded-3xl border bg-background p-2 shadow-sm flex items-end gap-2">
              <Textarea value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Assign task or ask anything..." className="min-h-[72px] border-0 focus-visible:ring-0" />
              <Button onClick={sendMessage} size="icon" disabled={working || !messageInput.trim()} className="rounded-2xl h-10 w-10">
                {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="h-full overflow-hidden border-border/70">
          <CardContent className="h-full p-0 flex flex-col">
            <div className="border-b p-3 flex items-center justify-between">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'code' | 'preview')}>
                <TabsList>
                  <TabsTrigger value="code" className="gap-2"><Braces className="h-4 w-4" /> Code</TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2"><Eye className="h-4 w-4" /> Preview</TabsTrigger>
                </TabsList>
              </Tabs>
              <Badge variant="secondary"><Database className="h-3 w-3 mr-1" /> Live website preview</Badge>
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
