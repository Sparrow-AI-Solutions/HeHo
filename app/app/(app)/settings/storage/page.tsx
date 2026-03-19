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
  
  const [connectedBucket, setConnectedBucket] = useState("")
  const [bucketInput, setBucketInput] = useState("")
  
  const [storageColumns, setStorageColumns] = useState<string[]>([])
  const [newColumnName, setNewColumnName] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isSavingColumns, setIsSavingColumns] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('storage_bucket, storage_columns')
          .eq('id', user.id)
          .single()

        if (userError) {
          setError("Failed to load user data.")
        } else if (userData) {
          setConnectedBucket(userData.storage_bucket || "")
          setStorageColumns(userData.storage_columns || [])
        }
      }
      setLoading(false)
    }
    fetchUserData()
  }, [supabase])

  const handleConnect = async () => {
    if (!bucketInput) {
      setError("Please enter a bucket name.")
      return
    }
    setIsConnecting(true)
    setError(null)
    setSuccess(null)

    const response = await fetch('/api/database/connect-storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucketName: bucketInput, storageColumns }),
    })
    const data = await response.json()

    if (response.ok) {
      setSuccess(data.message)
      if (data.data) {
        setConnectedBucket(data.data.storage_bucket || "")
        setStorageColumns(data.data.storage_columns || [])
        setBucketInput("")
      }
    } else {
      setError(data.error)
    }
    setIsConnecting(false)
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    setError(null)
    setSuccess(null)
    const response = await fetch('/api/database/connect-storage', {
      method: 'DELETE',
    })
    const data = await response.json()

    if (response.ok) {
      setConnectedBucket("")
      setStorageColumns([])
      setSuccess(data.message)
    } else {
      setError(data.error)
    }
    setIsDisconnecting(false)
  }

  const handleAddColumn = () => {
    if (newColumnName.trim() && !storageColumns.includes(newColumnName.trim())) {
      setStorageColumns([...storageColumns, newColumnName.trim()])
      setNewColumnName("")
    }
  }

  const handleRemoveColumn = (columnToRemove: string) => {
    setStorageColumns(storageColumns.filter(col => col !== columnToRemove))
  }

  const handleSaveChanges = async () => {
    if (!connectedBucket) {
      setError("Please connect a storage bucket first.")
      return
    }

    setIsSavingColumns(true)
    setError(null)
    setSuccess(null)
    
    const response = await fetch("/api/database/connect-storage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucketName: connectedBucket, storageColumns }),
    })
    const data = await response.json()

    if (response.ok) {
      setSuccess("Storage columns saved successfully!")
      if (data.data) {
        setStorageColumns(data.data.storage_columns || [])
      }
    } else {
      setError(data.error)
    }
    setIsSavingColumns(false)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Storage Settings</h1>
      {error && <Alert variant="destructive"><XCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert><CheckCircle className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Storage Bucket</CardTitle>
          <CardDescription>Connect or switch your Supabase storage bucket.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectedBucket && (
            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-md">
              <p>Connected to bucket: <strong className="text-green-600 dark:text-green-400">{connectedBucket}</strong></p>
              <Button onClick={handleDisconnect} variant="destructive" disabled={isDisconnecting} size="sm">
                {isDisconnecting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null} Disconnect
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Enter bucket name"
              value={bucketInput} 
              onChange={(e) => setBucketInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
            />
            <Button onClick={handleConnect} disabled={isConnecting || !bucketInput}>
              {isConnecting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null} {connectedBucket ? 'Switch' : 'Connect'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Storage Columns</CardTitle>
          <CardDescription>Specify which table columns contain file links from your storage bucket. These columns will display a "View" button instead of raw links.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Input 
              placeholder="Add column name (e.g., document, file_url)" 
              value={newColumnName} 
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
            />
            <Button onClick={handleAddColumn} size="sm"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-2 min-h-[40px] p-3 bg-muted rounded-md border border-border/50">
            {storageColumns.length > 0 ? (
              storageColumns.map((col, index) => (
                <div key={index} className="flex items-center justify-between bg-background/50 p-2 rounded">
                  <span className="font-mono text-sm">{col}</span>
                  <Button 
                    onClick={() => handleRemoveColumn(col)} 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No columns specified. Add columns to enable file preview functionality.</p>
            )}
          </div>
          <Button 
            onClick={handleSaveChanges} 
            className="mt-4 w-full" 
            disabled={isSavingColumns || !connectedBucket}
          >
            {isSavingColumns ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null} Save Changes
          </Button>
          {!connectedBucket && (
            <p className="text-xs text-muted-foreground mt-2">Connect a storage bucket first to save column settings.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
