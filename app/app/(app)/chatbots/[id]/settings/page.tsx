'use client'

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Loader2, AlertCircle, ArrowLeft, Database, Copy, Check, Share2, Globe, Clock, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useChatbotShare } from '@/hooks/useChatbotShare'
import { Badge } from '@/components/ui/badge'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { formatDistanceToNow } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'

const MODELS = [
    { id: "arcee-ai/trinity-large-preview:free", name: "Arcee AI: Trinity Large Preview" },
    { id: "arcee-ai/trinity-mini:free", name: "Arcee AI: Trinity Mini" },
    { id: "liquid/lfm-2.5-1.2b-thinking:free", name: "Liquid: LFM 2.5 1.2B Thinking" },
    { id: "qwen/qwen3-next-80b-a3b-instruct:free", name: "Qwen: Qwen3 Next 80B Instruct" },
    { id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", name: "Venice: Dolphin Mistral 24B" },
    { id: "nousresearch/hermes-3-llama-3.1-405b:free", name: "Nous: Hermes 3 Llama 3.1 405B" },
    { id: "openrouter/hunter-alpha", name: "OpenRouter: Hunter Alpha" },
];

const TONES = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "strict", label: "Strict" },
]

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

const DEFAULT_TABLES = ['products', 'leads', 'customer_queries', 'sales'];

function ChatbotSettingsPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "config")
  const [chatbot, setChatbot] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    description: "",
    tone: "professional",
    model: "",
    theme: "sky",
    data_table_1: '',
    data_table_1_read: false,
    data_table_1_write: false,
    data_table_2: '',
    data_table_2_read: false,
    data_table_2_write: false,
    data_table_3: '',
    data_table_3_read: false,
    data_table_3_write: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [allDataSources, setAllDataSources] = useState<string[]>([]);
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const chatbotId = params.id as string

  const { share, loading: shareLoading, createShareLink, deleteShareLink } = useChatbotShare(chatbotId)

  const [deploying, setDeploying] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [expires, setExpires] = useState(false)
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined)
  const [countdown, setCountdown] = useState('')

  const deployUrl = share ? `${window.location.origin}/deploy/${share.share_token}` : ''

  useEffect(() => {
    if (share?.expires_at) {
      const updateCountdown = () => {
        const distance = formatDistanceToNow(new Date(share.expires_at!), { addSuffix: true })
        setCountdown(`Expires ${distance}`)
      }
      updateCountdown()
      const interval = setInterval(updateCountdown, 60000) // Update every minute
      return () => clearInterval(interval)
    }
  }, [share])

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/login")
          return
        }

        // Fetch chatbot data
        const { data: chatbotData } = await supabase.from("chatbots").select("*").eq("id", chatbotId).eq("user_id", user.id).single()

        if (!chatbotData) {
          router.push("/app/dashboard")
          return
        }

        setChatbot(chatbotData)
        setFormData({
          name: chatbotData.name,
          goal: chatbotData.goal,
          description: chatbotData.description,
          tone: chatbotData.tone,
          model: chatbotData.model,
          theme: chatbotData.theme || "sky",
          data_table_1: chatbotData.data_table_1 || '_none_',
          data_table_1_read: chatbotData.data_table_1_read || false,
          data_table_1_write: chatbotData.data_table_1_write || false,
          data_table_2: chatbotData.data_table_2 || '_none_',
          data_table_2_read: chatbotData.data_table_2_read || false,
          data_table_2_write: chatbotData.data_table_2_write || false,
          data_table_3: chatbotData.data_table_3 || '_none_',
          data_table_3_read: chatbotData.data_table_3_read || false,
          data_table_3_write: chatbotData.data_table_3_write || false,
        })

        // Fetch connected tables
        const { data: tablesData } = await supabase.from('user_connected_tables').select('table_name').eq('user_id', user.id)
        const customTableNames = tablesData?.map(t => t.table_name) || [];
        const combinedSources = Array.from(new Set([...DEFAULT_TABLES, ...customTableNames]));
        setAllDataSources(combinedSources);

      } catch (err) {
        console.error(err)
        router.push("/app/dashboard")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [chatbotId, router, supabase])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: updateError } = await supabase
        .from("chatbots")
        .update({
          name: formData.name,
          goal: formData.goal,
          description: formData.description,
          tone: formData.tone,
          model: formData.model,
          theme: formData.theme,
          data_table_1: formData.data_table_1 === '_none_' ? null : formData.data_table_1,
          data_table_1_read: formData.data_table_1_read,
          data_table_1_write: formData.data_table_1_write,
          data_table_2: formData.data_table_2 === '_none_' ? null : formData.data_table_2,
          data_table_2_read: formData.data_table_2_read,
          data_table_2_write: formData.data_table_2_write,
          data_table_3: formData.data_table_3 === '_none_' ? null : formData.data_table_3,
          data_table_3_read: formData.data_table_3_read,
          data_table_3_write: formData.data_table_3_write,
        })
        .eq("id", chatbotId)

      if (updateError) throw updateError

      setSuccess("Settings saved successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleDeploy = async () => {
    setDeploying(true)
    await createShareLink(expires ? expiryDate! : null)
    setDeploying(false)
  }

  const handleUndeploy = async () => {
    setDeploying(true)
    await deleteShareLink()
    setDeploying(false)
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const renderDataSourceSelect = (index: 1 | 2 | 3) => (
    <div className='space-y-2'>
      <label className='block text-sm font-medium text-foreground mb-2'>Data Source {index} (Optional)</label>
      <Select
        value={formData[`data_table_${index}`]}
        onValueChange={(value) => setFormData({ ...formData, [`data_table_${index}`]: value })}
      >
        <SelectTrigger className='bg-background/50 border-border/50'>
          <SelectValue placeholder='Select a table' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='_none_'>None</SelectItem>
          {allDataSources.map((tableName) => (
            <SelectItem key={tableName} value={tableName}>
              {tableName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {formData[`data_table_${index}`] && formData[`data_table_${index}`] !== '_none_' && (
        <div className="flex gap-4 mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={`read-${index}`} 
              checked={formData[`data_table_${index}_read`]}
              onCheckedChange={(checked) => setFormData({ ...formData, [`data_table_${index}_read`]: !!checked })}
            />
            <label htmlFor={`read-${index}`} className="text-xs text-muted-foreground cursor-pointer">Allow Read</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={`write-${index}`} 
              checked={formData[`data_table_${index}_write`]}
              onCheckedChange={(checked) => setFormData({ ...formData, [`data_table_${index}_write`]: !!checked })}
            />
            <label htmlFor={`write-${index}`} className="text-xs text-muted-foreground cursor-pointer">Allow Write</label>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 pt-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push("/app/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{chatbot.name}</h1>
            <p className="text-muted-foreground">Manage your chatbot settings and deployment</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-card/50 border-border/50">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="data">Data Sources</TabsTrigger>
            <TabsTrigger value="deploy">Deployment</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle>Identity</CardTitle>
                    <CardDescription>Basic information about your chatbot</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Chatbot Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Primary Goal</label>
                      <Input
                        value={formData.goal}
                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                        className="bg-background/50 border-border/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">System Prompt</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="min-h-[200px] bg-background/50 border-border/50"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle>Intelligence</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">AI Model</label>
                      <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="Select an AI model" />
                        </SelectTrigger>
                        <SelectContent>
                          {MODELS.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tone</label>
                      <div className="grid grid-cols-1 gap-2">
                        {TONES.map((tone) => (
                          <Button
                            key={tone.value}
                            variant={formData.tone === tone.value ? "default" : "outline"}
                            className="justify-start h-9"
                            onClick={() => setFormData({ ...formData, tone: tone.value })}
                          >
                            {tone.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle>Theme</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                      {THEMES.map((theme) => (
                        <button
                          key={theme.value}
                          className={`h-10 rounded-md transition-all ${theme.color} ${
                            formData.theme === theme.value ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                          }`}
                          onClick={() => setFormData({ ...formData, theme: theme.value })}
                          title={theme.label}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full h-12 text-lg font-bold" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>

                {error && (
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
                    <Check className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Data Connectivity
                </CardTitle>
                <CardDescription>Connect your chatbot to your Supabase tables</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderDataSourceSelect(1)}
                {renderDataSourceSelect(2)}
                {renderDataSourceSelect(3)}
                
                <div className="pt-4">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                    Save Data Sources
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deploy" className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Public Deployment
                </CardTitle>
                <CardDescription>Share your chatbot with the world</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!share ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Set Expiration</Label>
                          <p className="text-xs text-muted-foreground">Link will automatically deactivate after this date</p>
                        </div>
                        <Switch checked={expires} onCheckedChange={setExpires} />
                      </div>
                      
                      {expires && (
                        <div className="pt-2">
                          <DateTimePicker date={expiryDate} setDate={setExpiryDate} />
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full h-12 text-lg font-bold" 
                      onClick={handleDeploy} 
                      disabled={deploying || (expires && !expiryDate)}
                    >
                      {deploying ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <Share2 className="mr-2 h-5 w-5" />
                          Deploy Chatbot
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <div>
                          <p className="text-sm font-medium text-emerald-500">Currently Deployed</p>
                          {countdown && <p className="text-[10px] text-emerald-500/70 flex items-center gap-1"><Clock className="h-3 w-3" /> {countdown}</p>}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleUndeploy} disabled={deploying}>
                        Undeploy
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Public URL</label>
                        <div className="flex gap-2">
                          <Input value={deployUrl} readOnly className="bg-background/50 border-border/50" />
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(deployUrl, "url")}>
                            {copied === "url" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="icon" asChild>
                            <Link href={deployUrl} target="_blank">
                              <Globe className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Embed Code (Iframe)</label>
                        <div className="relative">
                          <pre className="p-4 bg-background/50 border border-border/50 rounded-lg text-[10px] overflow-x-auto">
                            {`<iframe\n  src="${deployUrl}"\n  width="100%"\n  height="700px"\n  frameborder="0"\n></iframe>`}
                          </pre>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() =>
                              copyToClipboard(`<iframe src="${deployUrl}" width="100%" height="700px" frameborder="0"></iframe>`, "embed")
                            }
                          >
                            {copied === "embed" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ChatbotSettingsPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ChatbotSettingsPage />
    </Suspense>
  )
}
