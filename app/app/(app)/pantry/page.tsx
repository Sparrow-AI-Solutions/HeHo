'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Loader2, 
  Package, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Database as DatabaseIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

interface ConnectedBucket {
  id: string
  bucket_name: string
  created_at: string
}

export default function PantryPage() {
  const [pantryId, setPantryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectedBuckets, setConnectedBuckets] = useState<ConnectedBucket[]>([])
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null)
  const [bucketContent, setBucketContent] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editMode, setEditMode] = useState<'value' | 'full'>('value')
  const [newBucketName, setNewBucketName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loadingBucket, setLoadingBucket] = useState(false)

  const supabase = createClient()

  // Initialize and fetch data
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
            await fetchConnectedBuckets()
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

  const fetchConnectedBuckets = async () => {
    try {
      const response = await fetch('/api/pantry/buckets')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to fetch buckets (${response.status})`)
      }

      const result = await response.json()
      setConnectedBuckets(result.data || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching buckets:', err)
      setError(err.message)
    }
  }

  const fetchBucketContent = async (bucketName: string) => {
    setLoadingBucket(true)
    try {
      const response = await fetch(`/api/pantry?basket=${encodeURIComponent(bucketName)}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to fetch bucket (${response.status})`)
      }

      const data = await response.json()
      setBucketContent(data)
      setSelectedBucket(bucketName)
      setIsEditing(false)
      setEditMode('value')
    } catch (err: any) {
      console.error('Error fetching bucket:', err)
      toast.error(err.message || 'Failed to fetch bucket content')
    } finally {
      setLoadingBucket(false)
    }
  }

  const handleAddBucket = async () => {
    if (!newBucketName.trim()) {
      toast.error('Please enter a bucket name')
      return
    }
    
    setIsAdding(true)
    try {
      const response = await fetch('/api/pantry/buckets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucketName: newBucketName.trim() })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to add bucket (${response.status})`)
      }

      toast.success(`Bucket "${newBucketName}" added`)
      setNewBucketName('')
      await fetchConnectedBuckets()
    } catch (err: any) {
      console.error('Error adding bucket:', err)
      toast.error(err.message || 'Failed to add bucket')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteBucket = async (bucketId: string, bucketName: string) => {
    if (!confirm(`Are you sure you want to remove the bucket "${bucketName}" from your app?`)) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/pantry/buckets?id=${bucketId}`, { 
        method: 'DELETE' 
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to delete bucket (${response.status})`)
      }

      toast.success(`Bucket "${bucketName}" removed`)
      if (selectedBucket === bucketName) {
        setSelectedBucket(null)
        setBucketContent(null)
      }
      await fetchConnectedBuckets()
    } catch (err: any) {
      console.error('Error deleting bucket:', err)
      toast.error(err.message || 'Failed to delete bucket')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveBucket = async () => {
    if (!selectedBucket) return
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basketName: selectedBucket, data: bucketContent || {} })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to save bucket (${response.status})`)
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
                  value={value === null ? 'null' : value.toString()} 
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
      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6" />
              Pantry Not Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Connect your Pantry ID in settings to manage JSON storage.</p>
            <Button asChild className="w-full">
              <Link href="/app/settings">Go to Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Pantry Storage</h1>
            <p className="text-xs sm:text-base text-muted-foreground mt-1">Manage your JSON buckets.</p>
          </div>
          
          {/* Desktop buttons */}
          <div className="hidden sm:flex gap-2">
            <Button asChild variant="outline" className="border-border h-9 sm:h-10">
              <Link href="/app/settings"><Plus className="mr-2 h-4 w-4"/> Connect Pantry</Link>
            </Button>
          </div>

          {/* Mobile buttons */}
          <div className="sm:hidden flex flex-col gap-2 w-full">
            <Button asChild variant="outline" className="w-full border-border h-9">
              <Link href="/app/settings"><Plus className="mr-2 h-4 w-4"/> Connect Pantry</Link>
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {selectedBucket ? (
          // Bucket Editor View
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <DatabaseIcon className="h-5 w-5 text-primary" />
                    {selectedBucket}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <>
                      <Button size="sm" onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedBucket(null)}>
                        <X className="h-4 w-4 mr-2" />
                        Close
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => {
                        setIsEditing(false)
                        fetchBucketContent(selectedBucket)
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
                      size="xs" 
                      className="text-[10px] h-7 px-2"
                      onClick={() => setEditMode('value')}
                    >
                      Values
                    </Button>
                    <Button 
                      variant={editMode === 'full' ? 'secondary' : 'ghost'} 
                      size="xs" 
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
                    } catch (err) {
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
          // Buckets Grid View
          <>
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  placeholder="Enter bucket name" 
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddBucket()}
                  className="h-9 bg-background/50 text-xs sm:text-sm flex-1"
                />
                <Button size="sm" onClick={handleAddBucket} disabled={isAdding || !newBucketName.trim()} className="shrink-0">
                  {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Create
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {connectedBuckets.length > 0 ? (
                connectedBuckets.map(bucket => (
                  <div key={bucket.id} className="relative">
                    <Card 
                      className="border-border/50 bg-card hover:border-foreground/30 hover:bg-card/80 transition-all cursor-pointer h-full flex flex-col"
                      onClick={() => fetchBucketContent(bucket.bucket_name)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-foreground flex items-center gap-3 text-base sm:text-lg truncate">
                          <DatabaseIcon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground flex-shrink-0"/>
                          <span className="truncate">{bucket.bucket_name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col justify-between">
                        <p className="text-muted-foreground text-xs sm:text-sm">Click to view and edit this bucket's data.</p>
                        <div className="mt-4 p-2 rounded-md bg-green-500/10 border border-green-500/50 text-green-500 text-[10px] sm:text-xs flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0"/>
                            <span>Full JSON editing enabled.</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteBucket(bucket.id, bucket.bucket_name)
                      }}
                      disabled={isDeleting}
                      className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 bg-background/80 backdrop-blur-sm"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="col-span-full">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-xl p-12 text-center bg-card/30">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                      <DatabaseIcon className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Buckets Connected</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                      Create a new bucket or connect an existing one to get started.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
