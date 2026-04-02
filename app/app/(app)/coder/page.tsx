'use client'

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Send, 
  Loader2, 
  Code, 
  Eye, 
  Plus, 
  Github, 
  Database, 
  MessageSquare, 
  ChevronDown,
  Monitor,
  Layout,
  FileCode,
  Zap,
  Globe,
  Settings,
  Package
} from "lucide-react"
import { useRouter } from "next/navigation"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

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
}

interface Table {
  table_name: string
  columns: any[]
}

/* ================= PAGE ================= */

export default function CoderPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [view, setView] = useState<"chat" | "code" | "preview">("chat")
  const [htmlCode, setHtmlCode] = useState("<!DOCTYPE html>\n<html>\n<head>\n<style>\nbody { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f0f0; }\n.card { background: white; padding: 2rem; border-radius: 1rem; shadow: 0 4px 6px rgba(0,0,0,0.1); }\n</style>\n</head>\n<body>\n<div class='card'>\n<h1>Hello from ARAS</h1>\n<p>Start coding to see changes here.</p>\n</div>\n<script>\nconsole.log('Preview ready');\n</script>\n</body>\n</html>")
  const [cssCode, setCssCode] = useState("")
  const [jsCode, setJsCode] = useState("")
  
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [selectedChatbots, setSelectedChatbots] = useState<string[]>([])
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState("qwen/qwen3-next-80b-a3b-instruct:free")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const models = [
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "arcee-ai/trinity-large-preview:free",
    "liquid/lfm-2.5-1.2b-thinking:free",
    "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
    "openrouter/hunter-alpha"
  ]

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return router.push("/login")

        const { data: userData } = await supabase.from("users").select("heho_api_key").eq("id", user.id).single()
        const apiKey = userData?.heho_api_key

        if (apiKey) {
          // Fetch chatbots
          const cbRes = await fetch("/api/v1/chatbots/manage", {
            headers: { "Authorization": `Bearer ${apiKey}` }
          })
          const cbData = await cbRes.json()
          setChatbots(cbData.chatbots || [])

          // Fetch tables
          const tbRes = await fetch("/api/v1/database/manage", {
            headers: { "Authorization": `Bearer ${apiKey}` }
          })
          const tbData = await tbRes.json()
          setTables(tbData.tables || [])
        }
      } catch (err) {
        console.error("Error loading data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

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
      const res = await fetch("/api/coder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: currentInput, 
          history: messages.map(m => ({ role: m.role, content: m.content })),
          model: selectedModel,
          selectedChatbots,
          selectedTables,
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
                  
                  // Extract code if present using tags [HTML], [CSS], [JS]
                  const extractCode = (tag: string) => {
                    const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)(\\[\\/${tag}\\]|\\[${tag}\\]|$)`, 'i');
                    const match = accumulatedContent.match(regex);
                    return match ? match[1].trim() : null;
                  };

                  const h = extractCode('HTML');
                  const c = extractCode('CSS');
                  const j = extractCode('JS');

                  if (h) setHtmlCode(h);
                  if (c) setCssCode(c);
                  if (j) setJsCode(j);

                  setMessages((prev) => 
                    prev.map((msg) => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: accumulatedContent } 
                        : msg
                    )
                  );
                }
              } catch (e) {}
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

  const toggleChatbot = (id: string) => {
    setSelectedChatbots(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleTable = (name: string) => {
    setSelectedTables(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const getCombinedPreview = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          ${cssCode}
        </style>
      </head>
      <body>
        ${htmlCode}
        <script>
          ${jsCode}
        </script>
      </body>
      </html>
    `
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-10">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold text-foreground">Coder</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none">ARAS AI</Badge>
            </div>
            <p className="text-muted-foreground">Build websites and tools with AI-powered automation</p>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-border/50 bg-card/50">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="truncate max-w-[150px]">{selectedModel.split('/').pop()}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {models.map(model => (
                  <DropdownMenuItem 
                    key={model} 
                    onClick={() => setSelectedModel(model)}
                    className="flex justify-between items-center"
                  >
                    {model.split('/').pop()}
                    {selectedModel === model && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex bg-card/50 border border-border/50 rounded-lg p-1">
              <Button 
                variant={view === "chat" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setView("chat")}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </Button>
              <Button 
                variant={view === "code" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setView("code")}
                className="gap-2"
              >
                <Code className="h-4 w-4" />
                Code
              </Button>
              <Button 
                variant={view === "preview" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setView("preview")}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-250px)]">
          
          {/* Main Content Area */}
          <div className={`lg:col-span-${view === "chat" ? "12" : "7"} flex flex-col h-full`}>
            {view === "chat" && (
              <Card className="flex-1 flex flex-col border-border/50 bg-card/50 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20">
                      <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
                        <Code className="h-10 w-10 text-primary" />
                      </div>
                      <h2 className="text-4xl font-serif text-foreground mb-4">What can I do for you?</h2>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Ask ARAS to build a website, manage your database, or create a new chatbot.
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 w-full max-w-2xl">
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-border/50 bg-background/50 hover:bg-background">
                          <MessageSquare className="h-5 w-5 text-blue-500" />
                          <span className="text-xs">New Chatbot</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-border/50 bg-background/50 hover:bg-background">
                          <Database className="h-5 w-5 text-green-500" />
                          <span className="text-xs">New Tables</span>
                        </Button>
                        <Button variant="outline" disabled className="h-auto py-4 flex-col gap-2 border-border/50 bg-background/50 opacity-50 cursor-not-allowed">
                          <Zap className="h-5 w-5 text-purple-500" />
                          <span className="text-xs">Melius (Beta)</span>
                        </Button>
                        <Button variant="outline" disabled className="h-auto py-4 flex-col gap-2 border-border/50 bg-background/50 opacity-50 cursor-not-allowed">
                          <Package className="h-5 w-5 text-orange-500" />
                          <span className="text-xs">Pantry (Beta)</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                            m.role === "user" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted border border-border/50"
                          }`}>
                            <div className="prose dark:prose-invert max-w-none text-sm">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border/50 bg-background/30">
                  <div className="relative flex flex-col gap-3 bg-background border border-border/50 rounded-2xl p-3 shadow-sm focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                    <div className="flex items-center gap-2 border-b border-border/30 pb-2 mb-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Chatbots ({selectedChatbots.length})
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          {chatbots.length === 0 ? (
                            <div className="p-2 text-xs text-muted-foreground">No chatbots found</div>
                          ) : (
                            chatbots.map(cb => (
                              <DropdownMenuItem key={cb.id} onClick={() => toggleChatbot(cb.id)} className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${selectedChatbots.includes(cb.id) ? "bg-primary" : "bg-muted"}`} />
                                {cb.name}
                              </DropdownMenuItem>
                            ))
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground">
                            <Database className="h-3.5 w-3.5" />
                            Tables ({selectedTables.length})
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          {tables.length === 0 ? (
                            <div className="p-2 text-xs text-muted-foreground">No tables found</div>
                          ) : (
                            tables.map(tb => (
                              <DropdownMenuItem key={tb.table_name} onClick={() => toggleTable(tb.table_name)} className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${selectedTables.includes(tb.table_name) ? "bg-primary" : "bg-muted"}`} />
                                {tb.table_name}
                              </DropdownMenuItem>
                            ))
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                        <Github className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-end gap-2">
                      <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask ARAS to build something..."
                        className="min-h-[40px] max-h-[200px] border-none focus-visible:ring-0 bg-transparent resize-none p-0 text-sm"
                      />
                      <Button 
                        size="icon" 
                        onClick={() => handleSendMessage()} 
                        disabled={!input.trim() || sending}
                        className="h-9 w-9 shrink-0 rounded-xl"
                      >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {view === "code" && (
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex-1 grid grid-rows-3 gap-4">
                  <Card className="border-border/50 bg-card/50 flex flex-col overflow-hidden">
                    <div className="px-4 py-2 border-b border-border/50 flex justify-between items-center bg-muted/30">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-orange-500" />
                        <span className="text-xs font-medium">index.html</span>
                      </div>
                    </div>
                    <textarea 
                      className="flex-1 bg-transparent p-4 text-xs font-mono resize-none focus:outline-none"
                      value={htmlCode}
                      onChange={(e) => setHtmlCode(e.target.value)}
                    />
                  </Card>
                  <Card className="border-border/50 bg-card/50 flex flex-col overflow-hidden">
                    <div className="px-4 py-2 border-b border-border/50 flex justify-between items-center bg-muted/30">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-medium">style.css</span>
                      </div>
                    </div>
                    <textarea 
                      className="flex-1 bg-transparent p-4 text-xs font-mono resize-none focus:outline-none"
                      value={cssCode}
                      onChange={(e) => setCssCode(e.target.value)}
                    />
                  </Card>
                  <Card className="border-border/50 bg-card/50 flex flex-col overflow-hidden">
                    <div className="px-4 py-2 border-b border-border/50 flex justify-between items-center bg-muted/30">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs font-medium">script.js</span>
                      </div>
                    </div>
                    <textarea 
                      className="flex-1 bg-transparent p-4 text-xs font-mono resize-none focus:outline-none"
                      value={jsCode}
                      onChange={(e) => setJsCode(e.target.value)}
                    />
                  </Card>
                </div>
              </div>
            )}

            {view === "preview" && (
              <Card className="flex-1 border-border/50 bg-white overflow-hidden">
                <div className="h-8 border-b border-border/50 flex items-center px-4 gap-2 bg-gray-50">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-white border border-border/50 rounded px-2 py-0.5 text-[10px] text-muted-foreground flex items-center gap-1 min-w-[200px]">
                      <Globe className="h-3 w-3" />
                      localhost:3000
                    </div>
                  </div>
                </div>
                <iframe 
                  title="preview"
                  className="w-full h-full border-none"
                  srcDoc={getCombinedPreview()}
                />
              </Card>
            )}
          </div>

          {/* Right Preview Panel (only shown when not in full chat view) */}
          {view !== "chat" && (
            <div className="lg:col-span-5 flex flex-col h-full gap-4">
               {view === "code" ? (
                 <Card className="flex-1 border-border/50 bg-white overflow-hidden shadow-lg">
                    <div className="h-8 border-b border-border/50 flex items-center px-4 gap-2 bg-gray-50">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground ml-2">Live Preview</span>
                    </div>
                    <iframe 
                      title="side-preview"
                      className="w-full h-full border-none"
                      srcDoc={getCombinedPreview()}
                    />
                 </Card>
               ) : (
                 <Card className="flex-1 flex flex-col border-border/50 bg-card/50 overflow-hidden">
                    <div className="p-4 border-b border-border/50 bg-muted/30">
                      <h3 className="text-sm font-semibold">Conversation</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                       {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[90%] rounded-xl px-3 py-2 ${
                            m.role === "user" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted border border-border/50"
                          }`}>
                            <div className="prose dark:prose-invert max-w-none text-xs">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-border/50">
                       <div className="flex items-end gap-2 bg-background border border-border/50 rounded-xl p-2">
                        <Textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Reply..."
                          className="min-h-[30px] max-h-[100px] border-none focus-visible:ring-0 bg-transparent resize-none p-0 text-xs"
                        />
                        <Button 
                          size="icon" 
                          onClick={() => handleSendMessage()} 
                          disabled={!input.trim() || sending}
                          className="h-7 w-7 shrink-0 rounded-lg"
                        >
                          {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                 </Card>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
