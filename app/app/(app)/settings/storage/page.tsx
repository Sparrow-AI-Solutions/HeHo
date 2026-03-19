'use client'

import { useState, useEffect } from 'react'
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, Loader2, CheckCircle, XCircle } from "lucide-react"

export default function StorageSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // General saving state
  const [isSaving, setIsSaving] = useState(false)

  // Storage Bucket States
  const [connectedBucket, setConnectedBucket] = useState("")
  const [bucketInput, setBucketInput] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  
  // Pantry ID States
  const [pantryId, setPantryId] = useState("")
  const [pantryInput, setPantryInput] = useState("")
  const [isConnectingPantry, setIsConnectingPantry] = useState(false)
  const [isDisconnectingPantry, setIsDisconnectingPantry] = useState(false)

  // Storage Columns States
  const [storageColumns, setStorageColumns] = useState<string[]>([])
  const [newColumnName, setNewColumnName] = useState("")
  const [isSavingColumns, setIsSavingColumns] = useState(false)

  const supabase = createClient()

  // Fetch initial user data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('storage_bucket, storage_columns, pantry_id')
          .eq('id', user.id)
          .single()

        if (userError) {
          setError("Failed to load user data.")
        } else if (userData) {
          setConnectedBucket(userData.storage_bucket || "")
          setStorageColumns(userData.storage_columns || [])
          setPantryId(userData.pantry_id || "")
        }
      }
      setLoading(false)
    }
    fetchUserData()
  }, [supabase])

  const handleApiCall = async (apiRoute: string, method: string, body: object, successMessage: string) => {
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(apiRoute, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setSuccess(successMessage)
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }

  // --- Storage Bucket Handlers ---
  const handleConnectBucket = async () => {
    if (!bucketInput) {
      setError("Please enter a bucket name.")
      return
    }
    setIsConnecting(true)
    const data = await handleApiCall('/api/database/connect-storage', 'POST', { bucketName: bucketInput }, 'Storage bucket connected!')
    if (data && data.data) {
      setConnectedBucket(data.data.storage_bucket || "")
      setBucketInput("")
    }
    setIsConnecting(false)
  }

  const handleDisconnectBucket = async () => {
    setIsDisconnecting(true)
    const data = await handleApiCall('/api/database/connect-storage', 'DELETE', {}, 'Storage bucket disconnected!')
    if (data) {
      setConnectedBucket("")
      setStorageColumns([])
    }
    setIsDisconnecting(false)
  }
  
  // --- Pantry Handlers ---
  const handleConnectPantry = async () => {
    if (!pantryInput) {
        setError("Please enter a Pantry ID.")
        return
    }
    setIsConnectingPantry(true)
    const data = await handleApiCall('/api/pantry/connect', 'POST', { pantryId: pantryInput }, 'Pantry successfully connected!')
    if(data && data.data) {
        setPantryId(data.data.pantry_id || "")
        setPantryInput("")
    }
    setIsConnectingPantry(false)
  }

  const handleDisconnectPantry = async () => {
    setIsDisconnectingPantry(true)
    const data = await handleApiCall('/api/pantry/connect', 'DELETE', {}, 'Pantry successfully disconnected!')
    if(data) {
        setPantryId("")
    }
    setIsDisconnectingPantry(false)
  }

  // --- Storage Columns Handlers ---
  const handleAddColumn = () => {
    const trimmedName = newColumnName.trim()
    if (trimmedName && !storageColumns.includes(trimmedName)) {
      setStorageColumns([...storageColumns, trimmedName])
      setNewColumnName("")
    }
  }

  const handleRemoveColumn = (columnToRemove: string) => {
    setStorageColumns(storageColumns.filter(col => col !== columnToRemove))
  }

  const handleSaveStorageColumns = async () => {
    setIsSavingColumns(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        setError("You must be logged in.")
        setIsSavingColumns(false)
        return
    }
    const { error: updateError } = await supabase.from('users').update({ storage_columns: storageColumns }).eq('id', user.id)
    if(updateError) {
        setError(updateError.message)
    } else {
        setSuccess("Storage columns saved successfully!")
    }
    setIsSavingColumns(false)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Storage Settings</h1>
      
      {error && <Alert variant="destructive" className="mb-4"><XCircle className="h-4 w-4 mr-2" /><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="mb-4 border-green-500/50 text-green-700"><CheckCircle className="h-4 w-4 mr-2 text-green-600" /><AlertDescription>{success}</AlertDescription></Alert>}

      {/* --- SUPABASE BUCKET --- */}
      <Card>
        <CardHeader>
          <CardTitle>Supabase Storage Bucket</CardTitle>
          <CardDescription>Connect or switch your Supabase storage bucket.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectedBucket && (
            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-md">
              <p>Connected to bucket: <strong className="text-green-600 dark:text-green-400">{connectedBucket}</strong></p>
              <Button onClick={handleDisconnectBucket} variant="destructive" disabled={isDisconnecting} size="sm">
                {isDisconnecting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null} Disconnect
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Enter bucket name"
              value={bucketInput} 
              onChange={(e) => setBucketInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleConnectBucket()}
            />
            <Button onClick={handleConnectBucket} disabled={isConnecting || !bucketInput}>
              {isConnecting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null} {connectedBucket ? 'Switch' : 'Connect'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* --- PANTRY INTEGRATION --- */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pantry Integration</CardTitle>
          <CardDescription>Connect your Pantry JSON storage to sync data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {pantryId && (
                <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-md">
                    <p>Connected to Pantry: <strong className="text-green-600 dark:text-green-400 truncate">{pantryId}</strong></p>
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
                />
                <Button onClick={handleConnectPantry} disabled={isConnectingPantry || !pantryInput}>
                    {isConnectingPantry ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null} {pantryId ? 'Switch' : 'Connect'}
                </Button>
            </div>
        </CardContent>
      </Card>

      {/* --- STORAGE COLUMNS --- */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Storage Columns</CardTitle>
          <CardDescription>Specify which table columns contain file links from your storage bucket. These columns will display a "View" button instead of raw links.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Input 
              placeholder="Add column name (e.g., 'document')" 
              value={newColumnName} 
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
            />
            <Button onClick={handleAddColumn} size="icon" className="h-9 w-9 flex-shrink-0"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-2 min-h-[80px] p-3 bg-muted rounded-md border border-border/50">
            {storageColumns.length > 0 ? (
              storageColumns.map((col, index) => (
                <div key={index} className="flex items-center justify-between bg-background/50 p-2 rounded-md shadow-sm">
                  <span className="font-mono text-sm">{col}</span>
                  <Button 
                    onClick={() => handleRemoveColumn(col)} 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground p-2">No columns specified.</p>
            )}
          </div>
          <Button 
            onClick={handleSaveStorageColumns} 
            className="mt-4 w-full" 
            disabled={isSavingColumns || !connectedBucket}
          >
            {isSavingColumns ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null} Save Column Changes
          </Button>
           {!connectedBucket && (
            <p className="text-xs text-muted-foreground mt-2 text-center">Connect a storage bucket to save column settings.</p>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
