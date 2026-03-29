'use client'

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Loader2, AlertCircle, ArrowLeft, Database, Copy, Check, Share2, Globe, User, Bot, ExternalLink } from "lucide-react"
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

const HEHO_WH_RAILWAY_DEPLOY_URL = 'https://railway.com/deploy/YE1e0Y?referralCode=jl7dmK&utm_medium=integration&utm_source=template&utm_campaign=generic'

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
const DEFAULT_RAILWAY_DEPLOY_URL = 'https://railway.com/deploy/GxAsWe?referralCode=dTEQTr&utm_medium=integration&utm_source=template&utm_campaign=generic'

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
    data_table_1_edit: false,
    data_table_2: '',
    data_table_2_read: false,
    data_table_2_write: false,
    data_table_2_edit: false,
    data_table_3: '',
    data_table_3_read: false,
    data_table_3_write: false,
    data_table_3_edit: false,
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
  const [savingTelegram, setSavingTelegram] = useState(false)
  const [expires, setExpires] = useState(false)
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined)
  const [countdown, setCountdown] = useState('')
  const [telegramBotToken, setTelegramBotToken] = useState('')
  const [telegramAllowedUsers, setTelegramAllowedUsers] = useState('')
  const [telegramAllowAllUsers, setTelegramAllowAllUsers] = useState(true)
  const [hehoApiKey, setHehoApiKey] = useState('')
  const [whatsappServerUrl, setWhatsappServerUrl] = useState('')
  const [savingWhatsappServerUrl, setSavingWhatsappServerUrl] = useState(false)
  const [whatsappQrUrl, setWhatsappQrUrl] = useState<string | null>(null)
  const [whatsappStatus, setWhatsappStatus] = useState<'waiting_server_url' | 'waiting_scan' | 'connected'>('waiting_server_url')

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
        const { data: userData } = await supabase.from('users').select('heho_api_key').eq('id', user.id).single()

        if (!chatbotData) {
          router.push("/app/dashboard")
          return
        }

        setChatbot(chatbotData)
        const rawTelegramUsers = chatbotData.telegram_user || ''
        const normalizedTelegramUsers =
          typeof rawTelegramUsers === 'string'
            ? rawTelegramUsers
            : Array.isArray(rawTelegramUsers)
              ? rawTelegramUsers.join(',')
              : ''

        setTelegramBotToken(chatbotData.telegram_id || '')
        setTelegramAllowAllUsers(normalizedTelegramUsers === '' || normalizedTelegramUsers === '*')
        setTelegramAllowedUsers(normalizedTelegramUsers === '*' ? '' : normalizedTelegramUsers)
        setWhatsappServerUrl(chatbotData.server_url || '')

        const { data: hehoUserData } = await supabase.from('users').select('heho_api_key').eq('id', user.id).single()
        setHehoApiKey(hehoUserData?.heho_api_key || '')

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
          data_table_1_edit: chatbotData.data_table_1_edit || false,
          data_table_2: chatbotData.data_table_2 || '_none_',
          data_table_2_read: chatbotData.data_table_2_read || false,
          data_table_2_write: chatbotData.data_table_2_write || false,
          data_table_2_edit: chatbotData.data_table_2_edit || false,
          data_table_3: chatbotData.data_table_3 || '_none_',
          data_table_3_read: chatbotData.data_table_3_read || false,
          data_table_3_write: chatbotData.data_table_3_write || false,
          data_table_3_edit: chatbotData.data_table_3_edit || false,
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

  useEffect(() => {
    if (!chatbotId || !whatsappServerUrl) return

    let cancelled = false
    const fetchRemoteState = async () => {
      try {
        const response = await fetch(`/api/whatsapp/remote-state?chatbotId=${encodeURIComponent(chatbotId)}`, {
          cache: 'no-store',
        })
        const data = await response.json()
        if (!response.ok || cancelled) return

        setWhatsappStatus(data.status || 'waiting_scan')
        setWhatsappQrUrl(data.qr_url || null)
      } catch (err) {
        console.error('Failed to fetch WhatsApp remote state:', err)
      }
    }

    fetchRemoteState()
    const interval = setInterval(fetchRemoteState, 6000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [chatbotId, whatsappServerUrl])

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
          data_table_1_edit: formData.data_table_1_edit,
          data_table_2: formData.data_table_2 === '_none_' ? null : formData.data_table_2,
          data_table_2_read: formData.data_table_2_read,
          data_table_2_write: formData.data_table_2_write,
          data_table_2_edit: formData.data_table_2_edit,
          data_table_3: formData.data_table_3 === '_none_' ? null : formData.data_table_3,
          data_table_3_read: formData.data_table_3_read,
          data_table_3_write: formData.data_table_3_write,
          data_table_3_edit: formData.data_table_3_edit,
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const selectedTheme = THEMES.find((t) => t.value === formData.theme) || THEMES[0];
  const embedCode = `<!-- HeHo Chatbot Widget -->
<div id="heho-chatbot-${chatbotId}" style="height: 600px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"></div>
<script src="${window.location.origin}/embed.js"></script>
<script>
  HeHoChatbot.embed('${deployUrl}', 'heho-chatbot-${chatbotId}');
</script>`

  const iframeCode = `<iframe src="${deployUrl}" style="width: 100%; height: 600px; border: none; border-radius: 8px;" allow="microphone; camera"></iframe>`

  const handleSaveTelegramIntegration = async () => {
    if (!telegramBotToken.trim()) {
      setError('Please enter your Telegram bot token from BotFather.')
      return
    }

    if (!telegramAllowAllUsers && !telegramAllowedUsers.trim()) {
      setError('Enter at least one Telegram user/chat id or enable Allow all users.')
      return
    }

    setSavingTelegram(true)
    setError(null)
    setSuccess(null)

    try {
      const normalizedAllowedUsers = telegramAllowAllUsers
        ? '*'
        : telegramAllowedUsers
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean)
            .join(',')

      const { error: updateError } = await supabase
        .from('chatbots')
        .update({
          telegram_id: telegramBotToken.trim(),
          telegram_user: normalizedAllowedUsers,
        })
        .eq('id', chatbotId)

      if (updateError) throw updateError

      const webhookBase = window.location.origin
      const webhookUrl = `${webhookBase}/api/bot?chatbotId=${chatbotId}&token=${encodeURIComponent(telegramBotToken.trim())}`
      const setWebhookRes = await fetch(`https://api.telegram.org/bot${telegramBotToken.trim()}/setWebhook?url=${encodeURIComponent(webhookUrl)}`)
      const setWebhookResult = await setWebhookRes.json()
      if (!setWebhookRes.ok || !setWebhookResult?.ok) {
        throw new Error(setWebhookResult?.description || 'Failed to register Telegram webhook')
      }

      setSuccess('Telegram integration saved and webhook connected successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save Telegram integration')
    } finally {
      setSavingTelegram(false)
    }
  }

  const buildHehoWhRailwayLink = () => {
    const url = new URL(HEHO_WH_RAILWAY_DEPLOY_URL)
    const chatbotIdValue = chatbotId || ''
    const hehoApiKeyValue = hehoApiKey || ''
    const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://heho.vercel.app'
    const hehoApiValue = `${appOrigin}/api`

    url.searchParams.set('envs', 'HEHO_API,HEHO_API_KEY,CHATBOT_ID')
    url.searchParams.set('HEHO_API', hehoApiValue)
    url.searchParams.set('HEHO_API_KEY', hehoApiKeyValue)
    url.searchParams.set('CHATBOT_ID', chatbotIdValue)

    return url.toString()
  }

  const handleHostHehoWhOnRailway = () => {
    const deployLink = buildHehoWhRailwayLink()
    window.open(deployLink, '_blank', 'noopener,noreferrer')
  }

  const handleSaveWhatsappServerUrl = async () => {
    if (!hehoApiKey) {
      setError('Generate your HeHo API key in Settings before saving server URL.')
      return
    }
    if (!whatsappServerUrl.trim()) {
      setError('Please enter your deployed Railway server URL.')
      return
    }

    setSavingWhatsappServerUrl(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch('/api/whatsapp/server-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hehoApiKey}`,
        },
        body: JSON.stringify({
          chatbotId,
          serverUrl: whatsappServerUrl.trim(),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result?.error || 'Failed to save server URL')

      setWhatsappServerUrl(result.server_url || whatsappServerUrl.trim())
      setSuccess('Server URL saved. QR/status will now load in this app.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save WhatsApp server URL')
    } finally {
      setSavingWhatsappServerUrl(false)
    }
  }

  const renderDataSourceSelect = (index: 1 | 2 | 3) => (
    <div className='space-y-2'>
      <label className='block text-sm font-medium text-foreground mb-2'>Data Source {index} (Optional)</label>
      <Select
        value={formData[`data_table_${index}`] || '_none_'}
        onValueChange={(value) => setFormData({ ...formData, [`data_table_${index}`]: value })}
      >
        <SelectTrigger className='bg-background/50 border-border/50'>
          <SelectValue placeholder='Select a table' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='_none_'>None</SelectItem>
          {allDataSources.map((tableName) => (
            <SelectItem key={tableName} value={tableName}>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                {tableName}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className='flex items-center space-x-4'>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id={`read-${index}`}
            checked={formData[`data_table_${index}_read`]}
            onCheckedChange={(checked) => setFormData({ ...formData, [`data_table_${index}_read`]: !!checked })}
          />
          <label htmlFor={`read-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Read</label>
        </div>
        <div className='flex items-center space-x-2'>
           <Checkbox
            id={`write-${index}`}
            checked={formData[`data_table_${index}_write`]}
            onCheckedChange={(checked) => setFormData({ ...formData, [`data_table_${index}_write`]: !!checked })}
          />
          <label htmlFor={`write-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Write</label>
        </div>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id={`edit-${index}`}
            checked={formData[`data_table_${index}_edit`]}
            onCheckedChange={(checked) => setFormData({ ...formData, [`data_table_${index}_edit`]: !!checked })}
          />
          <label htmlFor={`edit-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Edit</label>
        </div>
      </div>
    </div>
  )


  if (loading || shareLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
        <Link href={`/app/chatbots/${chatbotId}`} className="text-primary hover:underline mb-8 flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Chat
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Chatbot Settings</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border/50 rounded-xl">
            <TabsTrigger value="config" className="rounded-lg">Configuration</TabsTrigger>
            <TabsTrigger value="theme" className="rounded-lg">Theme</TabsTrigger>
            <TabsTrigger value="deploy" className="rounded-lg">Deploy</TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <Card className="border-border/50 bg-card/50 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle>Edit Chatbot</CardTitle>
                <CardDescription>Update your chatbot configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-background/50 border-border/50 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Goal</label>
                  <Input
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="bg-background/50 border-border/50 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-background/50 border-border/50 min-h-32 rounded-xl"
                  />
                </div>

                {renderDataSourceSelect(1)}
                {renderDataSourceSelect(2)}
                {renderDataSourceSelect(3)}

                {allDataSources.length === 0 && (
                  <p className='text-xs text-muted-foreground mt-2'>No database tables found. <Link href="/app/database" className="text-primary hover:underline">Connect one here</Link>.</p>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tone</label>
                  <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                    <SelectTrigger className="bg-background/50 border-border/50 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">AI Model</label>
                  <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
                    <SelectTrigger className="bg-background/50 border-border/50 rounded-xl">
                      <SelectValue />
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

                {error && (
                  <Alert className="border-destructive/50 bg-destructive/5 rounded-xl">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-destructive">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-primary/50 bg-primary/5 rounded-xl">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-primary">{success}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-primary hover:bg-primary/90 rounded-xl h-12 text-lg font-semibold"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme">
            <Card className="border-border/50 bg-card/50 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle>Chatbot Theme</CardTitle>
                <CardDescription>Customize the appearance of your chatbot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-4">Select Theme</label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {THEMES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, theme: t.value })}
                        className={`aspect-square rounded-xl border-2 transition-all transform hover:scale-110 ${
                          formData.theme === t.value ? "border-primary ring-4 ring-primary/20 scale-110" : "border-border/50"
                        } ${t.color}`}
                        title={t.label}
                      >
                        <span className="sr-only">{t.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 font-medium">
                    Active Theme: <span className="text-foreground">{THEMES.find((t) => t.value === formData.theme)?.label}</span>
                  </p>
                </div>

                <div className="bg-background/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-inner">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    Live Preview
                  </h3>
                  <div className="space-y-6">
                    <div className="flex gap-3 justify-end items-start">
                      <div className="flex flex-col items-end gap-1 max-w-[85%]">
                        <div className={`px-4 py-3 rounded-2xl rounded-tr-none shadow-md ${selectedTheme.color} ${selectedTheme.textColor}`}>
                          <p className="text-sm sm:text-base font-medium">This is a user message</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">You</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    
                    <div className="flex gap-3 justify-start items-start">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${selectedTheme.color}`}>
                        <Bot className={`h-4 w-4 ${selectedTheme.textColor}`} />
                      </div>
                      <div className="flex flex-col items-start gap-1 max-w-[85%]">
                        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 text-foreground rounded-2xl rounded-tl-none px-4 py-3 shadow-md">
                          <p className="text-sm sm:text-base">This is a bot response. Notice how professional it looks!</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">{formData.name || 'Bot'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-primary hover:bg-primary/90 rounded-xl h-12 text-lg font-semibold"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Theme"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deploy">
             {!share ? (
          <Card className='border-border/50 bg-card/50 mb-8 rounded-2xl shadow-xl overflow-hidden'>
            <CardHeader>
              <CardTitle>Deploy Your Chatbot</CardTitle>
              <CardDescription>Make your chatbot publicly accessible.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <Alert className="rounded-xl border-primary/20 bg-primary/5">
                <Globe className='h-4 w-4 text-primary' />
                <AlertDescription className='text-foreground'>
                  Deploying will generate a public link. Anyone with this link can interact with your chatbot.
                </AlertDescription>
              </Alert>
              <div className='flex items-center space-x-2'>
                <Switch id='expires' checked={expires} onCheckedChange={setExpires} />
                <Label htmlFor='expires'>Set an expiration date</Label>
              </div>
              {expires && (
                <DateTimePicker date={expiryDate} setDate={setExpiryDate} />
              )}
              <Button
                onClick={handleDeploy}
                disabled={deploying || (expires && !expiryDate)}
                className='w-full bg-black dark:bg-white dark:text-black hover:opacity-90 text-white rounded-xl h-12 font-bold transition-all'
              >
                {deploying ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Globe className='mr-2 h-4 w-4' />}
                Deploy Chatbot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
              <Card className='border-border/50 bg-card/50 rounded-2xl shadow-xl'>
                <CardHeader>
                  <CardTitle className='text-green-500 flex items-center gap-2'>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Deployment Status
                  </CardTitle>
                  {share.expires_at && <p className='text-sm text-green-600/80 pt-2 font-medium'>{countdown}</p>}
                </CardHeader>
                <CardContent>
                  <Badge className='bg-green-500 text-white mb-4 px-3 py-1 rounded-full'>Active</Badge>
                  <p className='text-sm text-muted-foreground mb-6'>
                    Your chatbot is live. Anyone with the link can access it.
                  </p>
                  <Button
                    variant='outline'
                    onClick={handleUndeploy}
                    disabled={deploying}
                    className='w-full border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent rounded-xl'
                  >
                    {deploying ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'Undeploy Chatbot'}
                  </Button>
                </CardContent>
              </Card>

              <Card className='border-border/50 bg-card/50 rounded-2xl shadow-xl'>
                <CardHeader>
                  <CardTitle>Public URL</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex gap-2'>
                    <Input value={deployUrl} readOnly className='bg-background/50 border-border/50 text-foreground text-sm rounded-xl' />
                    <Button onClick={() => copyToClipboard(deployUrl, 'url')} className='bg-primary hover:bg-primary/90 text-white px-3 rounded-xl shrink-0'>
                      {copied === 'url' ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
                    </Button>
                  </div>
                  <Link href={deployUrl} target='_blank' className="block w-full">
                    <Button className='w-full border-border/50 text-foreground hover:bg-foreground/10 bg-transparent rounded-xl'>
                      <Share2 className='mr-2 h-4 w-4' />
                      Open Public Link
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue='embed' className='w-full'>
               <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border/50 rounded-xl">
                <TabsTrigger value="embed" className="rounded-lg">Embed Code</TabsTrigger>
                <TabsTrigger value="iframe" className="rounded-lg">iframe</TabsTrigger>
                <TabsTrigger value="api" className="rounded-lg">HeHo API</TabsTrigger>
              </TabsList>
              <TabsContent value='embed'>
                <Card className='border-border/50 bg-card/50 rounded-2xl shadow-xl'>
                  <CardHeader>
                      <CardTitle>Embed Widget</CardTitle>
                      <CardDescription>Add this code to your website to embed the chatbot widget</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='bg-background/80 border border-border/50 rounded-xl p-4 overflow-x-auto shadow-inner'>
                      <pre className='text-xs text-muted-foreground font-mono whitespace-pre-wrap break-words'>{embedCode}</pre>
                    </div>
                    <Button onClick={() => copyToClipboard(embedCode, 'embed')} className='w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 font-semibold'>
                      {copied === 'embed' ? <Check className='h-4 w-4 mr-2' /> : <Copy className='h-4 w-4 mr-2' />}Copy Embed Code
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value='iframe'>
                <Card className='border-border/50 bg-card/50 rounded-2xl shadow-xl'>
                   <CardHeader>
                    <CardTitle>iframe Embed</CardTitle>
                    <CardDescription>Embed your chatbot using an iframe tag</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='bg-background/80 border border-border/50 rounded-xl p-4 overflow-x-auto shadow-inner'>
                      <pre className='text-xs text-muted-foreground font-mono whitespace-pre-wrap break-words'>{iframeCode}</pre>
                    </div>
                    <Button onClick={() => copyToClipboard(iframeCode, 'iframe')} className='w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 font-semibold'>
                      {copied === 'iframe' ? <Check className='h-4 w-4 mr-2' /> : <Copy className='h-4 w-4 mr-2' />}Copy iframe Code
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value='api'>
                <Card className='border-border/50 bg-card/50 rounded-2xl shadow-xl'>
                  <CardHeader>
                    <CardTitle>Intreagtion</CardTitle>
                    <CardDescription>Integrate your chatbot with the HeHo API</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div>
                      <h3 className="text-base font-semibold">HeHo API Integration</h3>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Chatbot ID</label>
                      <div className='flex gap-2'>
                        <Input value={chatbotId} readOnly className='bg-background/50 border-border/50 text-foreground text-sm rounded-xl' />
                        <Button onClick={() => copyToClipboard(chatbotId, 'chatbotId')} className='bg-primary hover:bg-primary/90 text-white px-3 rounded-xl shrink-0'>
                          {copied === 'chatbotId' ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
                        </Button>
                      </div>
                    </div>
                    <p className='text-sm text-muted-foreground font-medium'>
                      For more information on integrating with the HeHo API, refer to the <a href="/api-documentation" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">API Documentation Page</a>.
                    </p>

                    <div className="pt-4 border-t border-border/50 space-y-4">
                      <div>
                        <h3 className="text-base font-semibold">Connect to Telegram Bot</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Connect this chatbot to Telegram using your BotFather bot token and optional allowed user/chat IDs.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Telegram Bot Token</label>
                        <Input
                          type="password"
                          placeholder="123456:AA..."
                          value={telegramBotToken}
                          onChange={(e) => setTelegramBotToken(e.target.value)}
                          className='bg-background/50 border-border/50 text-foreground text-sm rounded-xl'
                        />
                        <p className="text-xs text-muted-foreground">Use the bot token you got from @BotFather.</p>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-border/50 p-3 bg-background/40">
                        <div>
                          <p className="text-sm font-medium text-foreground">Allow all users</p>
                          <p className="text-xs text-muted-foreground">If enabled, any Telegram user can chat with this bot.</p>
                        </div>
                        <Switch checked={telegramAllowAllUsers} onCheckedChange={setTelegramAllowAllUsers} />
                      </div>

                      {!telegramAllowAllUsers && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">Allowed Telegram User/Chat IDs</label>
                          <Textarea
                            placeholder="123456789, 987654321"
                            value={telegramAllowedUsers}
                            onChange={(e) => setTelegramAllowedUsers(e.target.value)}
                            className='bg-background/50 border-border/50 text-foreground text-sm rounded-xl'
                          />
                          <p className="text-xs text-muted-foreground">Comma-separated IDs. Only these users/chats can message this bot.</p>
                        </div>
                      )}

                      <div className="bg-background/60 border border-border/50 rounded-xl p-3 text-xs text-muted-foreground space-y-2">
                        <p><strong>Webhook flow:</strong> User → Telegram → HeHo `/api/bot` webhook → HeHo AI → Telegram reply.</p>
                        <p>After saving, HeHo auto-runs Telegram <code>setWebhook</code> using this bot token.</p>
                      </div>

                      <Button
                        onClick={handleSaveTelegramIntegration}
                        disabled={savingTelegram}
                        className='w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 font-semibold'
                      >
                        {savingTelegram ? <Loader2 className='h-4 w-4 mr-2 animate-spin' /> : null}
                        Save Telegram Integration
                      </Button>
                    </div>

                    <div className="pt-4 border-t border-border/50 space-y-4">
                      <div>
                        <h3 className="text-base font-semibold">Connect WhatsApp (WAHA Direct)</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Deploy your own HeHo-WH server, then return here to scan QR directly inside HeHo.
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-background/40 p-4 space-y-2 text-sm text-muted-foreground">
                        <p><strong>Important:</strong> Make sure you have generated your HeHo API key from Settings before continuing.</p>
                        <p><strong>If you see “Chatbot not found”:</strong> check that <code>CHATBOT_ID</code> and <code>HEHO_API_KEY</code> are correct in Railway env vars.</p>
                        <p><strong>Step 1:</strong> Click the host button below to deploy your own HeHo-WH server on Railway.</p>
                        <p><strong>Step 2:</strong> After deployment, copy your deployed Railway service URL and paste it below.</p>
                        <p><strong>Step 3:</strong> Return to this page and scan QR shown in HeHo. Once connected, status becomes connected here.</p>
                        <p className="text-xs">HeHo sends <code>HEHO_API</code>, <code>HEHO_API_KEY</code>, and <code>CHATBOT_ID</code> as deployment env vars.</p>
                        <p className="text-xs">Current <code>CHATBOT_ID</code>: <code>{chatbotId}</code></p>
                        <p className="text-xs">
                          Current <code>HEHO_API_KEY</code>: <code>{hehoApiKey ? hehoApiKey : 'Not found — generate it from Settings first.'}</code>
                        </p>
                      </div>
                      <Button
                        onClick={handleHostHehoWhOnRailway}
                        className='w-full rounded-xl h-12 font-semibold'
                        variant="outline"
                      >
                        Host HeHo-WH on Railway
                      </Button>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Deployed Site URL</label>
                        <Input
                          placeholder="https://your-heho-wh.up.railway.app"
                          value={whatsappServerUrl}
                          onChange={(e) => setWhatsappServerUrl(e.target.value)}
                          className='bg-background/50 border-border/50 text-foreground text-sm rounded-xl'
                        />
                        <Button
                          onClick={handleSaveWhatsappServerUrl}
                          disabled={savingWhatsappServerUrl}
                          className='w-full rounded-xl h-11 font-semibold'
                        >
                          {savingWhatsappServerUrl ? <Loader2 className='h-4 w-4 mr-2 animate-spin' /> : null}
                          Save Deployed URL
                        </Button>
                      </div>

                      <div className="rounded-xl border border-border/50 bg-background/40 p-4 space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Status:{' '}
                          <span className="font-medium text-foreground">
                            {whatsappStatus === 'connected'
                              ? '✅ Connected'
                              : whatsappStatus === 'waiting_scan'
                                ? '⏳ Waiting for QR scan (If QR code dint appere your chatbot is connected to you number or some error at server side.)'
                                : '🕒 Waiting for deployed URL'}
                          </span>
                        </p>
                        {whatsappQrUrl && whatsappStatus !== 'connected' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={whatsappQrUrl}
                            alt="WhatsApp QR"
                            className="w-56 h-56 rounded-lg border border-border/50 bg-white p-2"
                          />
                        ) : (
                          <p className="text-xs text-muted-foreground">QR will appear here after URL is saved and session is ready.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ChatbotSettingsPageWrapper() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ChatbotSettingsPage />
    </Suspense>
  )
}
