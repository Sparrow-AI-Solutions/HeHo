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
      // We keep the storageColumns in the state even after disconnecting
      setSuccess(data.message)
    } else {
      setError(data.error)
    }
    setIsDisconnecting(false)
  }

  const handleAddColumn = () => {
    if (newColumnName && !storageColumns.includes(newColumnName)) {
      setStorageColumns([...storageColumns, newColumnName])
      setNewColumnName("")
    }
  }

  const handleRemoveColumn = (columnToRemove: string) => {
    setStorageColumns(storageColumns.filter(col => col !== columnToRemove))
  }

  const handleSaveChanges = async () => {
    setIsSavingColumns(true);
    setError(null);
    setSuccess(null);
    const response = await fetch("/api/database/connect-storage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucketName: connectedBucket, storageColumns }),
    });
    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message);
      if (data.data) {
        setStorageColumns(data.data.storage_columns || []);
      }
    } else {
      setError(data.error);
    }
    setIsSavingColumns(false);
  };

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
          <CardDescription>Connect your Supabase storage bucket.</CardDescription>
        </CardHeader>
        <CardContent>
          {connectedBucket ? (
            <div className="flex items-center justify-between">
              <p>Connected to bucket: <strong>{connectedBucket}</strong></p>
              <Button onClick={handleDisconnect} variant="destructive" disabled={isDisconnecting}>
                {isDisconnecting ? <Loader2 className="animate-spin mr-2" /> : null} Disconnect
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Enter bucket name" 
                value={bucketInput} 
                onChange={(e) => setBucketInput(e.target.value)} 
              />
              <Button onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? <Loader2 className="animate-spin mr-2" /> : null} Connect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Storage Columns</CardTitle>
          <CardDescription>Specify the columns from your storage that the chat can use.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Input 
              placeholder="Add column name" 
              value={newColumnName} 
              onChange={(e) => setNewColumnName(e.target.value)} 
            />
            <Button onClick={handleAddColumn}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-2">
            {storageColumns.map((col, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                <span>{col}</span>
                <Button onClick={() => handleRemoveColumn(col)} variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            ))}
          </div>
          <Button 
            onClick={handleSaveChanges} 
            className="mt-4" 
            disabled={isSavingColumns || !connectedBucket}
          >
            {isSavingColumns ? <Loader2 className="animate-spin mr-2" /> : null} Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
