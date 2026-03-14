'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function ReconnectSupabasePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [connectionSuccess, setConnectionSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true)
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push("/login")
        return
      }
      setUser(currentUser)
      setLoading(false)
    }

    loadUser()
  }, [router, supabase])

  const testSupabaseConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setError("Please provide both the Supabase URL and the Anon (Public) Key.")
      return
    }
    setTesting(true)
    setError(null)
    setSuccess(null)
    try {
      const testSupabase = createClient(supabaseUrl, supabaseKey)
      const { error: testError } = await testSupabase.from('users').select('id').limit(1)
      if (testError && testError.message.includes('Invalid API key')) {
        throw new Error("Invalid Supabase credentials. Check your URL and Anon Key.")
      }
      setConnectionSuccess(true)
      setSuccess("Connection successful! Click 'Save' to update your credentials.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to Supabase")
      setConnectionSuccess(false)
    } finally {
      setTesting(false)
    }
  }

  const handleSaveSupabaseCredentials = async () => {
    if (!user) return
    if (!connectionSuccess) {
      setError("Please test the connection first before saving.")
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const { error } = await supabase
        .from("users")
        .update({ 
          supabase_url: supabaseUrl,
          supabase_key_encrypted: supabaseKey 
        })
        .eq("id", user.id)
      
      if (error) throw error
      
      setSuccess("Supabase credentials updated successfully!")
      setTimeout(() => {
        router.push("/app/settings")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save credentials")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/app/settings">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Settings
          </Link>
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-2">Reconnect Supabase</h1>
        <p className="text-muted-foreground mb-8">Update your Supabase database connection credentials.</p>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 border-green-500/50 bg-green-500/10 text-green-300">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Supabase Connection Details</CardTitle>
            <CardDescription>Enter your Supabase project URL and Anon (Public) Key.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Supabase URL</label>
              <Input 
                type="text" 
                placeholder="https://[project_ref].supabase.co" 
                value={supabaseUrl} 
                onChange={(e) => {
                  setSupabaseUrl(e.target.value)
                  setConnectionSuccess(false)
                }}
                className="mt-2 bg-background border-border" 
              />
              <p className="text-xs text-muted-foreground mt-1">You can find this in your Supabase project settings.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Supabase Anon (Public) Key</label>
              <Input 
                type="password" 
                placeholder="ey..." 
                value={supabaseKey} 
                onChange={(e) => {
                  setSupabaseKey(e.target.value)
                  setConnectionSuccess(false)
                }}
                className="mt-2 bg-background border-border" 
              />
              <p className="text-xs text-muted-foreground mt-1">This is your public API key, not your service role key.</p>
            </div>

            {connectionSuccess && (
              <Alert className="border-green-500/50 bg-green-500/10 text-green-300">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Connection verified successfully!</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={testSupabaseConnection} 
                disabled={!supabaseUrl || !supabaseKey || testing}
                variant="outline"
                className="flex-1"
              >
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
              <Button 
                onClick={handleSaveSupabaseCredentials} 
                disabled={!connectionSuccess || saving}
                className="flex-1 bg-foreground text-background hover:bg-muted"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Credentials'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
