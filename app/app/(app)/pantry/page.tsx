'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Plus,
  Loader2,
  Package as PackageIcon,
  CheckCircle,
  Database as DatabaseIcon,
  AlertCircle,
  Edit2,
  Save,
  X,
  Trash2,
  Link2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from "sonner"

interface Basket {
  name: string
  ttl: number
}

export default function PantryPage() {
  const [pantryId, setPantryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [baskets, setBaskets] = useState<Basket[]>([])
  const [selectedBasket, setSelectedBasket] = useState<string | null>(null)
  const [bucketContent, setBucketContent] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editMode, setEditMode] = useState<'value' | 'full'>('value')
  const [isCreating, setIsCreating] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loadingBucket, setLoadingBucket] = useState(false)
  const [bucketDialogOpen, setBucketDialogOpen] = useState(false)
  const [bucketDialogMode, setBucketDialogMode] = useState<'create' | 'connect'>('create')
  const [bucketDialogValue, setBucketDialogValue] = useState('')

  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
          throw new Error('Authentication failed')
        }

        if (user) {
          const { data, error: dbError } = await supabase
            .from('users')
            .select('pantry_id')
            .eq('id', user.id)
            .single()

          if (dbError) {
            throw new Error('Failed to load Pantry ID')
          }

          if (data?.pantry_id) {
            setPantryId(data.pantry_id)
            await fetchBaskets()
          }
        }
      } catch (err: any) {
        console.error('Error initializing:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [supabase])

  const fetchBaskets = async () => {
    try {
      const response = await fetch('/api/pantry/buckets')

      if (!response.ok) {
        const text = await response.text()
        const errorData = text ? JSON.parse(text) : { error: 'Unknown error' }
        throw new Error(errorData.error || 'Failed to fetch baskets')
      }

      const text = await response.text()
      const result = text ? JSON.parse(text) : { data: [] }
      setBaskets(result.data || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching baskets:', err)
      setError(err.message)
    }
  }

  const fetchBucketContent = async (bucketName: string) => {
    setLoadingBucket(true)
    try {
      const response = await fetch(`/api/pantry?basket=${encodeURIComponent(bucketName)}`)

      if (!response.ok) {
        const text = await response.text()
        const errorData = text ? JSON.parse(text) : { error: 'Unknown error' }
        throw new Error(errorData.error || 'Failed to fetch bucket')
      }

      const text = await response.text()
      const data = text ? JSON.parse(text) : {}
      setBucketContent(data)
      setSelectedBasket(bucketName)
      setIsEditing(false)
      setEditMode('value')
    } catch (err: any) {
      console.error('Error fetching bucket:', err)
      toast.error(err.message || 'Failed to fetch bucket content')
      throw err
    } finally {
      setLoadingBucket(false)
    }
  }

  const openBucketDialog = (mode: 'create' | 'connect') => {
    setBucketDialogMode(mode)
    setBucketDialogValue('')
    setBucketDialogOpen(true)
  }

  const closeBucketDialog = (force = false) => {
    if (!force && (isCreating || isConnecting)) return
    setBucketDialogOpen(false)
    setBucketDialogValue('')
  }

  const handleCreateBucket = async () => {
    const bucketName = bucketDialogValue.trim()
    if (!bucketName) {
      toast.error('Please enter a bucket name')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/pantry/buckets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basket: bucketName })
      })

      if (!response.ok) {
        const text = await response.text()
        const errorData = text ? JSON.parse(text) : { error: 'Unknown error' }
        throw new Error(errorData.error || 'Failed to create bucket')
      }

      toast.success(`Bucket "${bucketName}" created`)
      closeBucketDialog(true)
      await fetchBaskets()
      await fetchBucketContent(bucketName)
    } catch (err: any) {
      console.error('Error creating bucket:', err)
      toast.error(err.message || 'Failed to create bucket')
    } finally {
      setIsCreating(false)
    }
  }

  const handleConnectBucket = async () => {
    const bucketName = bucketDialogValue.trim()
    if (!bucketName) {
      toast.error('Please enter a bucket name')
      return
    }

    setIsConnecting(true)
    try {
      await fetchBucketContent(bucketName)
      closeBucketDialog(true)
      toast.success(`Bucket "${bucketName}" opened`)
    } catch (err: any) {
      console.error('Error connecting bucket:', err)
      toast.error(err.message || 'Failed to connect bucket')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDeleteBucket = async (bucketName: string) => {
    if (!confirm(`Are you sure you want to delete the bucket "${bucketName}"?`)) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/pantry/buckets?basket=${encodeURIComponent(bucketName)}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const text = await response.text()
        const errorData = text ? JSON.parse(text) : { error: 'Unknown error' }
        throw new Error(errorData.error || 'Failed to delete bucket')
      }

      toast.success(`Bucket "${bucketName}" deleted`)
      if (selectedBasket === bucketName) {
        setSelectedBasket(null)
        setBucketContent(null)
      }
      await fetchBaskets()
    } catch (err: any) {
      console.error('Error deleting bucket:', err)
      toast.error(err.message || 'Failed to delete bucket')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveBucket = async () => {
    if (!selectedBasket) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basket: selectedBasket, data: bucketContent || {} })
      })

      if (!response.ok) {
        const text = await response.text()
        const errorData = text ? JSON.parse(text) : { error: 'Unknown error' }
        throw new Error(errorData.error || 'Failed to save bucket')
      }

      toast.success('Bucket saved successfully')
      setIsEditing(false)
    } catch (err: any) {
      console.error('Error saving bucket:', err)
      toast.error(err.message || 'Failed to save bucket')
    } finally {
      setIsSaving(false)
    }
  }

  const updateValue = (path: string[], value: any) => {
    const newContent = { ...bucketContent }
    let current = newContent
    for (let i = 0; i < path.length - 1; i++) {
      if (!(path[i] in current)) {
        current[path[i]] = {}
      }
      current = current[path[i]]
    }
    current[path[path.length - 1]] = value
    setBucketContent(newContent)
  }

  const renderJsonEditor = (obj: any, path: string[] = []) => {
    if (typeof obj !== 'object' || obj === null) {
      return (
        <div className="flex items-center gap-2 py-1">
          <Input
            value={obj === null ? 'null' : obj.toString()}
            onChange={(e) => updateValue(path, e.target.value)}
            className="h-8 bg-background/50 text-xs"
            disabled={!isEditing || editMode === 'full'}
          />
        </div>
      )
    }

    return (
      <div className="pl-4 border-l border-border/50 space-y-2">
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground min-w-[80px]">{key}:</span>
              {typeof value === 'object' && value !== null ? (
                <span className="text-xs text-muted-foreground italic bg-muted px-1.5 py-0.5 rounded">
                  {Array.isArray(value) ? 'Array' : 'Object'}
                </span>
              ) : (
                <Input
                  value={value === null ? 'null' : String(value ?? '')}
                  onChange={(e) => updateValue([...path, key], e.target.value)}
                  className="h-8 bg-background/50 flex-1 text-xs"
                  disabled={!isEditing || editMode === 'full'}
                />
              )}
            </div>
            {typeof value === 'object' && value !== null && renderJsonEditor(value, [...path, key])}
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!pantryId) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <Alert>
            <PackageIcon className="h-4 w-4" />
            <AlertTitle>Pantry not connected</AlertTitle>
            <AlertDescription>
              Add your Pantry ID in settings before managing buckets.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-full mx-auto">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Pantry</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your JSON buckets and values.</p>
            </div>
            {!selectedBasket && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => openBucketDialog('create')} disabled={isCreating || isConnecting}>
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Create Bucket
                </Button>
                <Button onClick={() => openBucketDialog('connect')} disabled={isCreating || isConnecting} variant="outline">
                  {isConnecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                  Connect Bucket
                </Button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {selectedBasket ? (
          <Card className="border border-border/50 rounded-lg bg-card/50 overflow-hidden">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <DatabaseIcon className="h-5 w-5 text-primary" />
                    {selectedBasket}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <>
                      <Button size="sm" onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedBasket(null)}>
                        <X className="h-4 w-4 mr-2" />
                        Close
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => {
                        setIsEditing(false)
                        fetchBucketContent(selectedBasket)
                      }}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveBucket} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="flex items-center gap-4 mt-4 p-2 bg-muted/30 rounded-md">
                  <span className="text-xs font-medium text-muted-foreground">Mode:</span>
                  <div className="flex gap-1">
                    <Button
                      variant={editMode === 'value' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="text-[10px] h-7 px-2"
                      onClick={() => setEditMode('value')}
                    >
                      Values
                    </Button>
                    <Button
                      variant={editMode === 'full' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="text-[10px] h-7 px-2"
                      onClick={() => setEditMode('full')}
                    >
                      Full JSON
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6 max-h-[600px] overflow-auto">
              {loadingBucket ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : editMode === 'full' && isEditing ? (
                <Textarea
                  value={JSON.stringify(bucketContent, null, 2)}
                  onChange={(e) => {
                    try {
                      setBucketContent(JSON.parse(e.target.value))
                    } catch {
                      // Allow invalid JSON while typing
                    }
                  }}
                  className="font-mono text-xs min-h-[400px] bg-background/50"
                />
              ) : (
                <div className="space-y-4">
                  {bucketContent && Object.keys(bucketContent).length > 0 ? (
                    renderJsonEditor(bucketContent)
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-sm">This bucket is empty.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="border border-border/50 rounded-lg bg-card/50 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
              {baskets.length > 0 ? (
                baskets.map((bucket) => (
                  <div
                    key={bucket.name}
                    className="border-b border-r border-border/50 last:border-r-0"
                  >
                    <div
                      className="group relative p-5 hover:bg-muted/20 transition-colors cursor-pointer h-full"
                      onClick={() => fetchBucketContent(bucket.name)}
                    >
                      <div className="pr-10">
                        <div className="flex items-center gap-3 mb-3">
                          <DatabaseIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <h2 className="text-base font-semibold truncate">{bucket.name}</h2>
                        </div>
                        <p className="text-muted-foreground text-sm">Click to view and edit this bucket&apos;s data.</p>
                        <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-green-500/10 border border-green-500/30 px-2 py-1 text-[11px] text-green-600 dark:text-green-400">
                          <CheckCircle className="h-3.5 w-3.5" />
                          JSON editing enabled
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteBucket(bucket.name)
                        }}
                        disabled={isDeleting}
                        className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                  <DatabaseIcon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No buckets found</h3>
                  <p className="max-w-sm text-sm mb-4">Create a new bucket or connect an existing one to start managing Pantry data.</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button onClick={() => openBucketDialog('create')} disabled={isCreating || isConnecting}>
                      {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      Create Bucket
                    </Button>
                    <Button onClick={() => openBucketDialog('connect')} disabled={isCreating || isConnecting} variant="outline">
                      {isConnecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                      Connect Bucket
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Dialog open={bucketDialogOpen} onOpenChange={(open) => { if (!open) closeBucketDialog() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{bucketDialogMode === 'create' ? 'Create Bucket' : 'Connect Bucket'}</DialogTitle>
            <DialogDescription>
              {bucketDialogMode === 'create'
                ? 'Enter the new Pantry bucket name you want to create.'
                : 'Enter the Pantry bucket name you want to open.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              value={bucketDialogValue}
              onChange={(e) => setBucketDialogValue(e.target.value)}
              placeholder={bucketDialogMode === 'create' ? 'new-bucket-name' : 'existing-bucket-name'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (bucketDialogMode === 'create') {
                    handleCreateBucket()
                  } else {
                    handleConnectBucket()
                  }
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => closeBucketDialog()} disabled={isCreating || isConnecting}>
              Cancel
            </Button>
            <Button
              onClick={bucketDialogMode === 'create' ? handleCreateBucket : handleConnectBucket}
              disabled={!bucketDialogValue.trim() || isCreating || isConnecting}
            >
              {bucketDialogMode === 'create' ? (
                isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />
              ) : (
                isConnecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />
              )}
              {bucketDialogMode === 'create' ? 'Create Bucket' : 'Connect Bucket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
