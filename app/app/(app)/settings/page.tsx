'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { CheckCircle, AlertCircle, Loader2, LogOut, Key, Database, User, Shield, Copy, Trash2, ExternalLink, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Service States
  const [openRouterKey, setOpenRouterKey] = useState("")
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [storageBucket, setStorageBucket] = useState("")
  const [storageColumns, setStorageColumns] = useState<string[]>([])
  const [newColumnName, setNewColumnName] = useState("")
  const [hehoApiKey, setHehoApiKey] = useState("");
  const [pantryId, setPantryId] = useState("")
  const [pantryInput, setPantryInput] = useState("")

  // Loading States
  const [saving, setSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSavingColumns, setIsSavingColumns] = useState(false);
  const [isConnectingPantry, setIsConnectingPantry] = useState(false)
  const [isDisconnectingPantry, setIsDisconnectingPantry] = useState(false)

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

      const { data } = await supabase.from("users").select("*, heho_api_key").eq("id", currentUser.id).single()

      if (data) {
        setOpenRouterKey(data.openrouter_key_encrypted || "")
        setSupabaseUrl(data.supabase_url || "")
        setSupabaseKey(data.supabase_key_encrypted || "")
        setHehoApiKey(data.heho_api_key || "")
        setStorageBucket(data.storage_bucket || "")
        setPantryId(data.pantry_id || "")
        const cols = data.storage_columns
        setStorageColumns(Array.isArray(cols) ? cols : [])
      }
      setLoading(false)
    }

    loadUserAndSettings()
  }, [router, supabase])

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const handleSaveOpenRouterKey = async () => {
    if (!user) return
    setSaving(true)
    clearMessages()
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

  // ... (Heho API Key handlers remain the same) 

  const handleGenerateHehoApiKey = async () => {
    if (!user) return;
    setIsGenerating(true);
    clearMessages()
    try {
      const randomBytes = new Uint8Array(12);
      window.crypto.getRandomValues(randomBytes);
      const apiKeyChars = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
      const newApiKey = `heho_${apiKeyChars}`;
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ heho_api_key: newApiKey })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setHehoApiKey(newApiKey);
      setSuccess('New Heho API Key generated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsGenerating(false);
    }
  }

  const handleDeleteHehoApiKey = async () => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete your Heho API key? This action is irreversible.")) return;
    setIsDeleting(true);
    clearMessages()
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ heho_api_key: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setHehoApiKey("");
      setSuccess('API Key deleted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsDeleting(false);
    }
  }
  
  // --- Pantry Handlers ---
  const handleConnectPantry = async () => {
      if (!pantryInput) {
          setError("Please enter a Pantry ID.")
          return
      }
      setIsConnectingPantry(true)
      clearMessages()
      try {
        const response = await fetch('/api/pantry/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pantryId: pantryInput })
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setSuccess(data.message)
        if (data.data) {
            setPantryId(data.data.pantry_id || "")
            setPantryInput("")
        }
      } catch (err: any) {
        setError(err.message)
      }
      setIsConnectingPantry(false)
  }

  const handleDisconnectPantry = async () => {
      setIsDisconnectingPantry(true)
      clearMessages()
      try {
        const response = await fetch('/api/pantry/connect', { method: 'DELETE' })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setSuccess(data.message)
        setPantryId("")
      } catch (err: any) {
        setError(err.message)
      }
      setIsDisconnectingPantry(false)
  }

  // ... (Storage bucket handlers remain the same)

  const handleConnectBucket = async () => {
    if (!user) return;
    setSaving(true);
    clearMessages()
    try {
      const response = await fetch("/api/database/connect-storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucketName: storageBucket, storageColumns }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error);
      }
      setSuccess("Storage bucket connected successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect storage bucket");
    } finally {
      setSaving(false);
    }
  }

  const handleAddColumn = () => {
    if (newColumnName.trim() && Array.isArray(storageColumns) && !storageColumns.includes(newColumnName.trim())) {
      setStorageColumns([...storageColumns, newColumnName.trim()])
      setNewColumnName("")
    }
  }

  const handleRemoveColumn = (columnToRemove: string) => {
    if (Array.isArray(storageColumns)) {
      setStorageColumns(storageColumns.filter(col => col !== columnToRemove))
    }
  }

  const handleSaveColumns = async () => {
    if (!storageBucket) {
      setError("Please connect a storage bucket first.")
      return
    }

    setIsSavingColumns(true)
    clearMessages()
    
    try {
      const response = await fetch("/api/database/connect-storage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucketName: storageBucket, storageColumns }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error)
      }
      setSuccess("Storage columns saved successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save storage columns")
    } finally {
      setIsSavingColumns(false)
    }
  }

  const handleCopy = () => {
    if (!hehoApiKey) return;
    navigator.clipboard.writeText(hehoApiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>
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
              <CardDescription>This key allows you to interact with the Heho API.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input value={hehoApiKey} readOnly placeholder={hehoApiKey ? "************************" : "No API Key generated"} className="bg-background/50 font-mono" />
                <Button variant="outline" size="icon" onClick={handleCopy} disabled={!hehoApiKey} className="shrink-0">
                  {isCopied ? <CheckCircle className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4"/>}
                </Button>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleGenerateHehoApiKey} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Key className="mr-2 h-4 w-4"/>}
                  {hehoApiKey ? 'Regenerate Key' : 'Generate Key'}
                </Button>

                {hehoApiKey && (
                  <Button variant="destructive" onClick={handleDeleteHehoApiKey} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Trash2 className="mr-2 h-4 w-4"/>}
                    Delete Key
                  </Button>
                )}
              </div>
               <p className="text-xs text-muted-foreground mt-3">Treat your API key like a password. <Link href="/api-docs" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Read the docs</Link> to learn how to use it.</p>
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

          {/* --- PANTRY INTEGRATION --- */}
          <Card className="border-border/50 bg-card/50">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Pantry Integration</CardTitle>
                  <CardDescription>Connect your Pantry JSON storage to sync data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {pantryId && (
                      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-md">
                          <p className="text-sm">Connected to Pantry: <strong className="text-green-400 truncate">{pantryId}</strong></p>
                          <Button onClick={handleDisconnectPantry} variant="destructive" disabled={isDisconnectingPantry} size="sm">
                              {isDisconnectingPantry ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null} Disconnect
                          </Button>
                      </div>
                  )}
                  <div className="flex items-center gap-2">
                      <Input 
                          placeholder="Enter your Pantry ID"
                          value={pantryInput}
                          onChange={(e) => setPantryInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleConnectPantry()}
                          className="bg-background/50"
                      />
                      <Button onClick={handleConnectPantry} disabled={isConnectingPantry || !pantryInput} className="shrink-0">
                          {isConnectingPantry ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null} {pantryId ? 'Switch' : 'Connect'}
                      </Button>
                  </div>
              </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Supabase</CardTitle>
              <CardDescription>Your database connection details.</CardDescription>
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
              <Button asChild className="w-full mt-4 bg-foreground text-background hover:bg-muted">
                <Link href="/app/settings/reconnect-supabase">Reconnect Supabase</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Storage Bucket</CardTitle>
              <CardDescription>Connect your Supabase storage bucket and configure storage columns.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Storage Bucket Connection */}
              <div className="pb-6 border-b border-border/50">
                <label className="text-sm font-medium text-muted-foreground block mb-2">Bucket Name</label>
                <div className="flex gap-2">
                  <Input 
                    type="text" 
                    placeholder="your-bucket-name" 
                    value={storageBucket} 
                    onChange={(e) => setStorageBucket(e.target.value)} 
                    className="bg-background/50" 
                  />
                  <Button onClick={handleConnectBucket} disabled={saving} className="shrink-0">
                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/></> : null} 
                    {storageBucket ? 'Update' : 'Connect'}
                  </Button>
                </div>
                {storageBucket && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">✓ Connected to: <strong>{storageBucket}</strong></p>
                )}
              </div>

              {/* Storage Columns Configuration */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Storage Columns</label>
                <p className="text-xs text-muted-foreground mb-3">Specify which table columns contain file links. These columns will show a "View" button in the database tab.</p>
                
                <div className="flex gap-2 mb-3">
                  <Input 
                    placeholder="Add column name (e.g., document, file_url)" 
                    value={newColumnName} 
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
                    className="bg-background/50"
                  />
                  <Button onClick={handleAddColumn} size="sm" variant="outline" className="shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 p-3 bg-muted/50 rounded-md border border-border/30 min-h-[40px]">
                  {Array.isArray(storageColumns) && storageColumns.length > 0 ? (
                    storageColumns.map((col, index) => (
                      <div key={index} className="flex items-center justify-between bg-background/50 p-2 rounded text-sm">
                        <span className="font-mono">{col}</span>
                        <Button 
                          onClick={() => handleRemoveColumn(col)} 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No columns specified</p>
                  )}
                </div>

                <Button 
                  onClick={handleSaveColumns} 
                  disabled={isSavingColumns || !storageBucket}
                  className="mt-3 w-full"
                >
                  {isSavingColumns ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Storage Columns
                </Button>

                {!storageBucket && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">⚠ Connect a storage bucket first to save column settings.</p>
                )}
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
