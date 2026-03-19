'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Plus, CheckCircle, XCircle, Trash2, Power, PowerOff } from "lucide-react"

export default function PantryPage() {
  const [pantryId, setPantryId] = useState<string | null>(null)
  const [allBuckets, setAllBuckets] = useState<string[]>([])
  const [connectedBuckets, setConnectedBuckets] = useState<string[]>([])
  const [newBucketName, setNewBucketName] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null) // To track which button is loading

  const supabase = createClient()

  const clearMessages = () => {
      setError(null)
      setSuccess(null)
  }

  const fetchPantryData = useCallback(async () => {
    clearMessages()
    setLoading(true)
    try {
        const response = await fetch('/api/pantry/buckets');
        const data = await response.json();

        if (!response.ok) {
            // Use the specific error from the API if available
            throw new Error(data.error || 'Failed to fetch Pantry data.');
        }

        setAllBuckets(data.allBuckets || []);
        setConnectedBuckets(data.connectedBuckets || []);
    } catch (err: any) {
        // This is the error that will trigger the settings prompt
        if (err.message.includes('Pantry ID not configured')) {
            setPantryId(null) // Explicitly set to null to show the prompt
        } else {
            setError(err.message)
        }
    } finally {
        setLoading(false)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    const checkUserAndFetch = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: userData } = await supabase.from('users').select('pantry_id').eq('id', user.id).single()
            if (userData?.pantry_id) {
                setPantryId(userData.pantry_id)
                fetchPantryData()
            } else {
                 setPantryId(null)
                 setLoading(false)
            }
        } else {
            setLoading(false)
        }
    }
    checkUserAndFetch()
  }, [supabase, fetchPantryData])

  const handleApiCall = async (apiRoute: string, method: string, body: object | null, successMessage: string, bucketName: string) => {
      clearMessages()
      setIsSubmitting(bucketName) // Use a unique identifier for the loading state
      try {
          const options: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
          if (body) options.body = JSON.stringify(body);

          const response = await fetch(apiRoute, options);
          const data = await response.json();

          if (!response.ok) throw new Error(data.error || `An unknown error occurred`);
          
          setSuccess(data.message || successMessage);
          await fetchPantryData(); // Refresh data on success
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsSubmitting(null);
      }
  }

  const handleConnect = (bucketName: string) => {
      handleApiCall('/api/pantry/buckets', 'PUT', { bucketName }, `Connected ${bucketName}`, `connect-${bucketName}`)
  }

  const handleDisconnect = (bucketName: string) => {
      handleApiCall(`/api/pantry/buckets?bucketName=${bucketName}`, 'DELETE', null, `Disconnected ${bucketName}`, `disconnect-${bucketName}`)
  }
  
  const handleCreateBucket = () => {
      if (!newBucketName.trim()) {
          setError("Please enter a name for the new bucket.")
          return
      }
      handleApiCall('/api/pantry/buckets', 'POST', { bucketName: newBucketName }, `Created ${newBucketName}`, 'create-new-bucket')
      setNewBucketName("")
  }

  // --- Render Logic ---
  if (loading && !isSubmitting) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if (!pantryId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-card border border-border/50 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-semibold mb-2">Pantry Not Connected</h2>
          <p className="text-muted-foreground mb-6">To use the Pantry features, you must first connect your Pantry ID in the settings.</p>
          <Button asChild><Link href="/app/settings">Go to Settings</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-4">Pantry Bucket Management</h1>
        
        {error && <Alert variant="destructive" className="mb-4"><XCircle className="h-4 w-4 mr-2" /><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert className="mb-4 border-green-500/50 text-green-700"><CheckCircle className="h-4 w-4 mr-2 text-green-600" /><AlertDescription>{success}</AlertDescription></Alert>}

        {/* Create New Bucket Card */}
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Create New Bucket</CardTitle>
                <CardDescription>Create a new bucket directly in your Pantry. It will be automatically connected.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Enter new bucket name"
                        value={newBucketName} 
                        onChange={(e) => setNewBucketName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateBucket()}
                    />
                    <Button onClick={handleCreateBucket} disabled={isSubmitting === 'create-new-bucket' || !newBucketName.trim()}>
                        {isSubmitting === 'create-new-bucket' ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4"/>} Create & Connect
                    </Button>
                </div>
            </CardContent>
        </Card>

        {/* Bucket List */}
        <Card>
            <CardHeader>
                <CardTitle>Available Buckets</CardTitle>
                <CardDescription>Connect or disconnect the buckets you want to access within HeHo.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading && isSubmitting ? <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div> : null}
                <div className="space-y-2">
                    {allBuckets.length > 0 ? allBuckets.map(bucket => {
                        const isConnected = connectedBuckets.includes(bucket);
                        return (
                            <div key={bucket} className="flex items-center justify-between bg-muted/50 p-3 rounded-md shadow-sm">
                                <span className="font-mono text-sm">{bucket}</span>
                                {isConnected ? (
                                    <Button 
                                        onClick={() => handleDisconnect(bucket)}
                                        variant="destructive"
                                        size="sm"
                                        disabled={isSubmitting === `disconnect-${bucket}`}
                                    >
                                        {isSubmitting === `disconnect-${bucket}` ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <PowerOff className="mr-2 h-4 w-4"/>} Disconnect
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={() => handleConnect(bucket)}
                                        variant="outline"
                                        size="sm"
                                        disabled={isSubmitting === `connect-${bucket}`}
                                    >
                                        {isSubmitting === `connect-${bucket}` ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4"/>} Connect
                                    </Button>
                                )}
                            </div>
                        );
                    }) : (
                      <p className="text-sm text-muted-foreground p-4 text-center">No buckets found in your Pantry.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
