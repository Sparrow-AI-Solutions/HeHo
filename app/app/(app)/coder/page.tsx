'use client'

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { 
  Send, 
  Loader2, 
  Code, 
  Eye, 
  Github, 
  Database, 
  MessageSquare, 
  ChevronDown,
  FileCode,
  Zap,
  Globe,
  Package,
  Copy,
  Check,
  Maximize2,
  Minimize2
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

export default function CoderPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [view, setView] = useState<"chat" | "code" | "preview">("chat")
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARAS Website</title>
</head>
<body>
  <div class="container">
    <h1>Hello from ARAS</h1>
    <p>Start coding to see changes here.</p>
  </div>
</body>
</html>`)
  const [cssCode, setCssCode] = useState(`* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  text-align: center;
  max-width: 500px;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 2rem;
}

p {
  color: #666;
  font-size: 1.1rem;
}`)
  const [jsCode, setJsCode] = useState(`console.log('ARAS Coder is ready!');

// Add interactivity here
document.addEventListener('DOMContentLoaded', function() {
  console.log('Page loaded');
});`)
  
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [selectedChatbots, setSelectedChatbots] = useState<string[]>([])
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState("qwen/qwen3-next-80b-a3b-instruct:free")
  const [copied, setCopied] = useState(false)
  const [fullscreenCode, setFullscreenCode] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return router.push("/login")

        const { data: userData } = await supabase.from("users").select("heho_api_key").eq("id", user.id).single()
        const apiKey = userData?.heho_api_key

        if (apiKey) {
          const cbRes = await fetch("/api/v1/chatbots/manage", {
            headers: { "Authorization": `Bearer ${apiKey}` }
          })
          const cbData = await cbRes.json()
          setChatbots(cbData.chatbots || [])

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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

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
    return `${htmlCode}\n<style>${cssCode}</style>\n<script>${jsCode}</script>`
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background pt-20 pb-0 overflow-hidden">
      {/* Header */}
      <div className="absolute top-20 left-0 right-0 z-40 px-4 sm:px-6 py-4 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Coder</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-xs">ARAS AI</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Build websites and tools with AI-powered automation</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-border/50 bg-card/50 text-xs sm:text-sm flex-1 sm:flex-none">
                  <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
                  <span className="truncate max-w-[100px] sm:max-w-[150px]">{selectedModel.split('/').pop()?.slice(0, 20)}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-50 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 text-xs sm:text-sm">
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
                className="gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Chat</span>
              </Button>
              <Button 
                variant={view === "code" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setView("code")}
                className="gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Code</span>
              </Button>
              <Button 
                variant={view === "preview" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setView("preview")}
                className="gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="absolute top-40 left-0 right-0 bottom-0 overflow-hidden">
        <div className="w-full h-full flex flex-col lg:flex-row gap-4 p-4 sm:p-6">
          
          {/* Chat Area - Full width on mobile, left side on desktop */}
          {view === "chat" && (
            <div className="flex-1 flex flex-col min-h-0 bg-card/50 border border-border/50 rounded-xl overflow-hidden">
              {/* Messages */}
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-4">
                      <Code className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif text-foreground mb-2">What can I do for you?</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                      Ask ARAS to build a website, manage your database, or create a new chatbot.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                      <Button variant="outline" className="h-auto py-3 flex-col gap-1 border-border/50 bg-background/50 hover:bg-background text-xs">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span>New Chatbot</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-3 flex-col gap-1 border-border/50 bg-background/50 hover:bg-background text-xs">
                        <Database className="h-4 w-4 text-green-500" />
                        <span>New Tables</span>
                      </Button>
                      <Button variant="outline" disabled className="h-auto py-3 flex-col gap-1 border-border/50 bg-background/50 opacity-50 cursor-not-allowed text-xs">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span>Melius</span>
                      </Button>
                      <Button variant="outline" disabled className="h-auto py-3 flex-col gap-1 border-border/50 bg-background/50 opacity-50 cursor-not-allowed text-xs">
                        <Package className="h-4 w-4 text-orange-500" />
                        <span>Pantry</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((m) => (
                      <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[90%] rounded-lg px-4 py-3 text-sm ${
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
              <div className="p-3 sm:p-4 border-t border-border/50 bg-background/50">
                <div className="flex flex-col gap-2 bg-background border border-border/50 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-1 border-b border-border/30 pb-2 mb-1 flex-wrap gap-y-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] sm:text-xs gap-1 text-muted-foreground hover:text-foreground">
                          <MessageSquare className="h-3 w-3" />
                          <span>CB ({selectedChatbots.length})</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48 text-xs">
                        {chatbots.length === 0 ? (
                          <div className="p-2 text-xs text-muted-foreground">No chatbots</div>
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
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] sm:text-xs gap-1 text-muted-foreground hover:text-foreground">
                          <Database className="h-3 w-3" />
                          <span>TBL ({selectedTables.length})</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48 text-xs">
                        {tables.length === 0 ? (
                          <div className="p-2 text-xs text-muted-foreground">No tables</div>
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

                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                      <Github className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-end gap-2">
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask ARAS to build something..."
                      className="min-h-[36px] max-h-[120px] border-none focus-visible:ring-0 bg-transparent resize-none p-0 text-xs sm:text-sm"
                    />
                    <Button 
                      size="icon" 
                      onClick={() => handleSendMessage()} 
                      disabled={!input.trim() || sending}
                      className="h-8 w-8 shrink-0 rounded-lg"
                    >
                      {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Code Editor - Full width on mobile, left side on desktop */}
          {view === "code" && (
            <div className="flex-1 flex flex-col gap-3 min-h-0 lg:col-span-1">
              <div className="flex-1 grid grid-rows-3 gap-3 min-h-0">
                {/* HTML */}
                <div className="flex flex-col min-h-0 bg-card/50 border border-border/50 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 border-b border-border/50 flex justify-between items-center bg-muted/30">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-xs font-medium">HTML</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyCode(htmlCode)}>
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <textarea 
                    className="flex-1 bg-transparent p-3 text-[11px] sm:text-xs font-mono resize-none focus:outline-none overflow-y-auto"
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                  />
                </div>

                {/* CSS */}
                <div className="flex flex-col min-h-0 bg-card/50 border border-border/50 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 border-b border-border/50 flex justify-between items-center bg-muted/30">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-xs font-medium">CSS</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyCode(cssCode)}>
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <textarea 
                    className="flex-1 bg-transparent p-3 text-[11px] sm:text-xs font-mono resize-none focus:outline-none overflow-y-auto"
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                  />
                </div>

                {/* JS */}
                <div className="flex flex-col min-h-0 bg-card/50 border border-border/50 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 border-b border-border/50 flex justify-between items-center bg-muted/30">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-3.5 w-3.5 text-yellow-500" />
                      <span className="text-xs font-medium">JavaScript</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyCode(jsCode)}>
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <textarea 
                    className="flex-1 bg-transparent p-3 text-[11px] sm:text-xs font-mono resize-none focus:outline-none overflow-y-auto"
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preview - Full width on mobile, right side on desktop */}
          {view === "preview" && (
            <div className="flex-1 flex flex-col min-h-0 bg-white border border-border/50 rounded-lg overflow-hidden">
              <div className="h-7 border-b border-border/50 flex items-center px-3 gap-2 bg-gray-50">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <span className="text-[9px] font-medium text-muted-foreground ml-2">localhost:3000</span>
              </div>
              <iframe 
                title="preview"
                className="flex-1 border-none bg-white"
                srcDoc={getCombinedPreview()}
              />
            </div>
          )}

          {/* Code + Preview Side by Side on Desktop */}
          {view === "code" && (
            <div className="hidden lg:flex flex-1 min-h-0 bg-white border border-border/50 rounded-lg overflow-hidden flex-col">
              <div className="h-7 border-b border-border/50 flex items-center px-3 gap-2 bg-gray-50">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <span className="text-[9px] font-medium text-muted-foreground ml-2">Live Preview</span>
              </div>
              <iframe 
                title="side-preview"
                className="flex-1 border-none bg-white"
                srcDoc={getCombinedPreview()}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
