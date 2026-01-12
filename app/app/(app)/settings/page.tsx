'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { CheckCircle, AlertCircle, Loader2, LogOut, Key, Database, User, Shield, Copy, Trash2, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [openRouterKey, setOpenRouterKey] = useState("")
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [hasApiKey, setHasApiKey] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadUserAndSettings = async () => {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push("/login")
        return
      }
      setUser(currentUser)

      const { data } = await supabase.from("users").select("*").eq("id", currentUser.id).single()

      if (data) {
        setOpenRouterKey(data.openrouter_key_encrypted || "")
        setSupabaseUrl(data.supabase_url || "")
        setSupabaseKey(data.supabase_key_encrypted || "")
        setHasApiKey(!!data.api_key_hash)
      }
      setLoading(false)
    }

    loadUserAndSettings()
  }, [router, supabase])

  const handleSaveOpenRouterKey = async () => {
    if (!user) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const { error } = await supabase
        .from("users")
        .update({ openrouter_key_encrypted: openRouterKey })
        .eq("id", user.id)
      if (error) throw error
      setSuccess("OpenRouter key saved successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateApiKey = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/user/api-key', { method: 'POST' });
      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = 'An error occurred.';
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.error || errorMessage;
        } catch (e) {
          errorMessage = `Server returned a non-JSON error response. Status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      setApiKey(data.apiKey);
      setHasApiKey(true);
      setSuccess('New Heho API Key generated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsGenerating(false);
    }
  }

  const handleDeleteApiKey = async () => {
    if (!confirm("Are you sure you want to delete your API key? This action is irreversible.")) return;
    setIsDeleting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/user/api-key', { method: 'DELETE' });
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = 'An error occurred.';
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.error || errorMessage;
        } catch (e) {
           errorMessage = `Server returned a non-JSON error response. Status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      setApiKey("");
      setHasApiKey(false);
      setSuccess('API Key deleted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsDeleting(false);
    }
  }

  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your account and application settings.</p>

        {error && <Alert variant="destructive" className="mb-6"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert className="mb-6 border-green-500/50 bg-green-500/10 text-green-300"><CheckCircle className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}
        
        <div className="space-y-8">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Account</CardTitle>
              <CardDescription>Your account information.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input value={user?.email || ""} disabled className="bg-background/50" />
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> Heho API Key</CardTitle>
              <CardDescription className="flex justify-between items-center">
                <span>This key allows you to interact with the Heho API.</span>
                <Link href="/api-docs" target="_blank" className="text-sm text-primary hover:underline flex items-center gap-1">
                  API Docs <ExternalLink className="h-4 w-4" />
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasApiKey && !apiKey && (
                <div className="p-4 rounded-md bg-background/50 text-muted-foreground text-sm">
                  You have an API key, but it can only be viewed once upon generation. If you have lost it, you must delete it and generate a new one.
                </div>
              )}

              {apiKey && (
                <div className="flex items-center gap-2">
                  <Input value={apiKey} readOnly className="bg-background/50 font-mono" />
                  <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
                    {isCopied ? <CheckCircle className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4"/>}
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button onClick={handleGenerateApiKey} disabled={isGenerating || hasApiKey}>
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Key className="mr-2 h-4 w-4"/>}
                  Generate API Key
                </Button>

                {hasApiKey && (
                  <Button variant="destructive" onClick={handleDeleteApiKey} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4"/>}
                    Delete API Key
                  </Button>
                )}
              </div>
               <p className="text-xs text-muted-foreground mt-3">Remember to treat your API key like a password. Do not share it publicly.</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> API Keys</CardTitle>
              <CardDescription>Manage your API keys for third-party services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">OpenRouter API Key</label>
                <Input type="password" placeholder="sk-or-..." value={openRouterKey} onChange={(e) => setOpenRouterKey(e.target.value)} className="mt-1 bg-background/50" />
                 <Button onClick={handleSaveOpenRouterKey} disabled={saving} size="sm" className="mt-2">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</> : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Supabase</CardTitle>
              <CardDescription>Your database connection details (locked).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                <label className="text-sm font-medium text-muted-foreground">Supabase URL</label>
                <Input type="text" placeholder="https://[project_ref].supabase.co" value={supabaseUrl} disabled className="mt-1 bg-background/50" />
              </div>
                <div>
                <label className="text-sm font-medium text-muted-foreground">Supabase Anon Key</label>
                <Input type="password" placeholder="ey..." value={supabaseKey} disabled className="mt-1 bg-background/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
            <CardContent><Button onClick={handleLogout} variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"><LogOut className="mr-2 h-4 w-4"/>Sign Out</Button></CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
