'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2, ArrowRight, Sparkles, Database } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'

const POPULAR_MODELS = [
    { id: "arcee-ai/trinity-large-preview:free", name: "Arcee AI: Trinity Large Preview" },
    { id: "arcee-ai/trinity-mini:free", name: "Arcee AI: Trinity Mini" },
    { id: "liquid/lfm-2.5-1.2b-thinking:free", name: "Liquid: LFM 2.5 1.2B Thinking" },
    { id: "qwen/qwen3-next-80b-a3b-instruct:free", name: "Qwen: Qwen3 Next 80B Instruct" },
    { id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", name: "Venice: Dolphin Mistral 24B" },
    { id: "nousresearch/hermes-3-llama-3.1-405b:free", name: "Nous: Hermes 3 Llama 3.1 405B" },
    { id: "openrouter/hunter-alpha", name: "OpenRouter: Hunter Alpha" },
];

const GOALS = [
  { value: 'support', label: 'Customer Support' },
  { value: 'sales', label: 'Sales Assistant' },
  { value: 'knowledge', label: 'Knowledge Base Q&A' },
  { value: 'lead', label: 'Lead Capture' },
  { value: 'custom', label: 'Custom' },
]

const TONES = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'strict', label: 'Strict' },
]

const THEMES = [
  { value: 'twilight', label: 'Twilight', color: 'bg-gradient-to-r from-slate-900 to-slate-700' },
  { value: 'sunrise', label: 'Sunrise', color: 'bg-gradient-to-r from-amber-300 to-orange-500' },
  { value: 'ocean', label: 'Ocean', color: 'bg-gradient-to-r from-cyan-500 to-blue-500' },
  { value: 'forest', label: 'Forest', color: 'bg-gradient-to-r from-emerald-500 to-lime-600' },
  { value: 'grape', label: 'Grape', color: 'bg-gradient-to-r from-violet-500 to-purple-500' },
  { value: 'rose', label: 'Rose', color: 'bg-gradient-to-r from-pink-500 to-rose-500' },
  { value: 'sky', label: 'Sky', color: 'bg-gradient-to-r from-sky-400 to-cyan-300' },
  { value: 'candy', label: 'Candy', color: 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400' },
]

const DEFAULT_TABLES = ['products', 'leads', 'customer_queries', 'sales'];

export default function CreateChatbotPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [generatingPrompt, setGeneratingPrompt] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    description: '',
    tone: 'professional',
    model: '',
    theme: 'sky',
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
  const [chatbotCount, setChatbotCount] = useState(0)
  const [allDataSources, setAllDataSources] = useState<string[]>([]);
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadInitialData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);

      const { count } = await supabase
        .from('chatbots')
        .select('*', { count: 'exact' })
        .eq('user_id', currentUser.id);
      setChatbotCount(count || 0);
      
      const { data: tablesData, error: tablesError } = await supabase
        .from('user_connected_tables')
        .select('table_name')
        .eq('user_id', currentUser.id);

      if (tablesError) {
        console.error("Error fetching tables: ", tablesError.message);
        setError("Failed to load connected tables. Please try again.")
      } else {
        const customTableNames = tablesData?.map(t => t.table_name) || [];
        const combinedSources = Array.from(new Set([...DEFAULT_TABLES, ...customTableNames]));
        setAllDataSources(combinedSources);
      }

      setLoading(false);
    };

    loadInitialData();
  }, [supabase, router]);

  const generatePromptFromGoal = async () => {
    if (!formData.name || !formData.goal) {
      setError('Please enter chatbot name and select a goal first')
      return
    }

    setGeneratingPrompt(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          goal: formData.goal,
          description: formData.description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate prompt')
      }

      const { prompt } = await response.json()
      setFormData((prev) => ({
        ...prev,
        description: prompt,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompt. Please write your own.')
      console.error(err)
    } finally {
      setGeneratingPrompt(false)
    }
  }

  const handleCreateChatbot = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)

    try {
      if (chatbotCount > 50) {
        throw new Error('You can only create 50 chatbot on the free plan.')
      }

      if (!formData.name || !formData.goal || !formData.description || !formData.model) {
        throw new Error('Please fill in all required fields and select an AI model')
      }

      if (formData.description.length < 200) {
        throw new Error('Project description must be at least 200 characters')
      }

      const { data, error: insertError } = await supabase
        .from('chatbots')
        .insert({
          user_id: user.id,
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
          status: 'active',
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push(`/app/chatbots/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chatbot')
    } finally {
      setCreating(false)
    }
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
    <div className='min-h-screen bg-background pb-20'>
      <div className='container mx-auto px-4 pt-8 max-w-4xl'>
        <div className='flex items-center gap-4 mb-8'>
          <Button variant='ghost' size='icon' onClick={() => router.back()}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h1 className='text-3xl font-bold text-foreground'>Create New Chatbot</h1>
            <p className='text-muted-foreground'>Configure your AI assistant and connect it to your data</p>
          </div>
        </div>

        <form onSubmit={handleCreateChatbot} className='space-y-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Left Column: Basic Config */}
            <div className='md:col-span-2 space-y-6'>
              <Card className='bg-card/50 border-border/50'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Sparkles className='h-5 w-5 text-primary' />
                    Identity & Intelligence
                  </CardTitle>
                  <CardDescription>Define who your chatbot is and how it thinks</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Chatbot Name</label>
                    <Input
                      placeholder='e.g. Customer Support Bot'
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className='bg-background/50 border-border/50'
                    />
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Primary Goal</label>
                    <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
                      <SelectTrigger className='bg-background/50 border-border/50'>
                        <SelectValue placeholder='What is the main purpose?' />
                      </SelectTrigger>
                      <SelectContent>
                        {GOALS.map((goal) => (
                          <SelectItem key={goal.value} value={goal.value}>
                            {goal.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex justify-between items-center'>
                      <label className='text-sm font-medium'>System Prompt (Project Description)</label>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={generatePromptFromGoal}
                        disabled={generatingPrompt}
                        className='h-8'
                      >
                        {generatingPrompt ? (
                          <Loader2 className='h-3 w-3 animate-spin mr-2' />
                        ) : (
                          <Sparkles className='h-3 w-3 mr-2' />
                        )}
                        Auto-Generate
                      </Button>
                    </div>
                    <Textarea
                      placeholder='Describe your project and how the chatbot should behave in detail (min 200 chars)...'
                      className='min-h-[200px] bg-background/50 border-border/50'
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <p className='text-[10px] text-muted-foreground'>
                      Characters: {formData.description.length} / 200 minimum
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-card/50 border-border/50'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Database className='h-5 w-5 text-primary' />
                    Data Connectivity
                  </CardTitle>
                  <CardDescription>Connect your chatbot to your Supabase tables</CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {renderDataSourceSelect(1)}
                  {renderDataSourceSelect(2)}
                  {renderDataSourceSelect(3)}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Model & Style */}
            <div className='space-y-6'>
              <Card className='bg-card/50 border-border/50'>
                <CardHeader>
                  <CardTitle className='text-lg'>Model & Tone</CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>AI Model</label>
                    <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
                      <SelectTrigger className='bg-background/50 border-border/50'>
                        <SelectValue placeholder='Select an AI model' />
                      </SelectTrigger>
                      <SelectContent>
                        {POPULAR_MODELS.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className='text-[10px] text-muted-foreground'>
                      Powered by OpenRouter. Switch anytime in settings.
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Communication Tone</label>
                    <div className='grid grid-cols-1 gap-2'>
                      {TONES.map((tone) => (
                        <Button
                          key={tone.value}
                          type='button'
                          variant={formData.tone === tone.value ? 'default' : 'outline'}
                          className='justify-start h-9'
                          onClick={() => setFormData({ ...formData, tone: tone.value })}
                        >
                          {tone.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-card/50 border-border/50'>
                <CardHeader>
                  <CardTitle className='text-lg'>Chat Theme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-4 gap-2'>
                    {THEMES.map((theme) => (
                      <button
                        key={theme.value}
                        type='button'
                        className={`h-10 rounded-md transition-all ${theme.color} ${
                          formData.theme === theme.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                        }`}
                        onClick={() => setFormData({ ...formData, theme: theme.value })}
                        title={theme.label}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button type='submit' className='w-full h-12 text-lg font-bold' disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Chatbot
                    <ArrowRight className='ml-2 h-5 w-5' />
                  </>
                )}
              </Button>

              {error && (
                <Alert variant='destructive' className='bg-destructive/10 border-destructive/20'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

import { ArrowLeft } from 'lucide-react'
