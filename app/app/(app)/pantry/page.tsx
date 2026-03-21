'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Loader2, 
  Package, 
  Settings, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Database,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

interface PantryBasket {
  name: string;
  ttl: number;
}

interface PantryData {
  name: string;
  description: string;
  errors: any[];
  notifications: boolean;
  percentFull: number;
  baskets: PantryBasket[];
}

export default function PantryPage() {
  const [pantryId, setPantryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pantryData, setPantryData] = useState<PantryData | null>(null)
  const [selectedBasket, setSelectedBasket] = useState<string | null>(null)
  const [basketContent, setBasketContent] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editMode, setEditMode] = useState<'value' | 'full'>('value')
  const [newBasketName, setNewBasketName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loadingBasket, setLoadingBasket] = useState(false)

  const supabase = createClient()

  const fetchPantryInfo = useCallback(async (id: string) => {
    try {
      const response = await fetch('/api/pantry')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to fetch Pantry data (${response.status})`)
      }

      const data = await response.json()
      setPantryData(data)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching Pantry info:', err)
      setError(err.message || 'Failed to fetch Pantry data')
    }
  }, [])

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
            throw new Error('Failed to load Pantry ID from profile')
          }

          if (data?.pantry_id) {
            setPantryId(data.pantry_id)
            await fetchPantryInfo(data.pantry_id)
          }
        }
      } catch (err: any) {
        console.error('Error initializing Pantry:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [supabase, fetchPantryInfo])

  const fetchBasketContent = async (basketName: string) => {
    setLoadingBasket(true)
    try {
      const response = await fetch(`/api/pantry?basket=${encodeURIComponent(basketName)}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to fetch basket (${response.status})`)
      }

      const data = await response.json()
      setBasketContent(data)
      setSelectedBasket(basketName)
      setIsEditing(false)
      setEditMode('value')
      setError(null)
    } catch (err: any) {
      console.error('Error fetching basket:', err)
      toast.error(err.message || 'Failed to fetch basket content')
    } finally {
      setLoadingBasket(false)
    }
  }

  const handleCreateBasket = async () => {
    if (!newBasketName.trim()) {
      toast.error('Please enter a bucket name')
      return
    }
    
    setIsCreating(true)
    try {
      const response = await fetch('/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basketName: newBasketName.trim(), data: {} })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to create basket (${response.status})`)
      }

      toast.success(`Bucket "${newBasketName}" created`)
      setNewBasketName('')
      if (pantryId) await fetchPantryInfo(pantryId)
    } catch (err: any) {
      console.error('Error creating basket:', err)
      toast.error(err.message || 'Failed to create bucket')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteBasket = async (basketName: string) => {
    if (!confirm(`Are you sure you want to delete bucket "${basketName}"?`)) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/pantry?basket=${encodeURIComponent(basketName)}`, { 
        method: 'DELETE' 
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to delete basket (${response.status})`)
      }

      toast.success(`Bucket "${basketName}" deleted`)
      if (selectedBasket === basketName) {
        setSelectedBasket(null)
        setBasketContent(null)
      }
      if (pantryId) await fetchPantryInfo(pantryId)
    } catch (err: any) {
      console.error('Error deleting basket:', err)
      toast.error(err.message || 'Failed to delete bucket')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveBasket = async () => {
    if (!selectedBasket) return
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basketName: selectedBasket, data: basketContent || {} })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Failed to save basket (${response.status})`)
      }

      toast.success('Bucket saved successfully')
      setIsEditing(false)
      setError(null)
    } catch (err: any) {
      console.error('Error saving basket:', err)
      toast.error(err.message || 'Failed to save bucket')
    } finally {
      setIsSaving(false)
    }
  }

  const updateValue = (path: string[], value: any) => {
    const newContent = { ...basketContent }
    let current = newContent
    for (let i = 0; i < path.length - 1; i++) {
      if (!(path[i] in current)) {
        current[path[i]] = {}
      }
      current = current[path[i]]
    }
    current[path[path.length - 1]] = value
    setBasketContent(newContent)
  }

  const renderJsonEditor = (obj: any, path: string[] = []) => {
    if (typeof obj !== 'object' || obj === null) {
      return (
        <div className="flex items-center gap-2 py-1">
          <Input 
            value={obj === null ? 'null' : obj.toString()} 
            onChange={(e) => updateValue(path, e.target.value)}
            className="h-8 bg-background/50"
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
              <span className="text-sm font-medium text-muted-foreground min-w-[80px]">{key}:</span>
              {typeof value === 'object' && value !== null ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground italic bg-muted px-1.5 py-0.5 rounded">
                    {Array.isArray(value) ? 'Array' : 'Object'}
                  </span>
                  {isEditing && editMode === 'full' && (
                    <span className="text-[10px] text-muted-foreground">(Edit in Full JSON mode)</span>
                  )}
                </div>
              ) : (
                <Input 
                  value={value === null ? 'null' : value.toString()} 
                  onChange={(e) => updateValue([...path, key], e.target.value)}
                  className="h-8 bg-background/50 flex-1"
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

  if (loading && !pantryData && !selectedBasket) {
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
            <CardDescription>
              Connect your Pantry ID in settings to manage your JSON storage.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Package className="h-8 w-8 text-primary" />
              Pantry Storage
            </h1>
            <p className="text-muted-foreground mt-1">Manage your JSON buckets and data.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => pantryId && fetchPantryInfo(pantryId)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/app/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar: Buckets List */}
          <div className="space-y-6">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  Buckets
                  <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {pantryData?.baskets.length || 0}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="New bucket name" 
                    value={newBasketName}
                    onChange={(e) => setNewBasketName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateBasket()}
                    className="h-9 bg-background/50"
                  />
                  <Button size="sm" onClick={handleCreateBasket} disabled={isCreating || !newBasketName.trim()}>
                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
                  {pantryData?.baskets && pantryData.baskets.length > 0 ? (
                    pantryData.baskets.map((basket) => (
                      <div 
                        key={basket.name}
                        className={`
                          group flex items-center justify-between p-2 rounded-md transition-colors cursor-pointer
                          ${selectedBasket === basket.name ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-muted/50 border border-transparent'}
                        `}
                        onClick={() => fetchBasketContent(basket.name)}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Database className="h-4 w-4 shrink-0" />
                          <span className="text-sm font-medium truncate">{basket.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteBasket(basket.name)
                          }}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-sm text-muted-foreground italic">No buckets found.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pantry Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono truncate ml-2">{pantryId}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Usage:</span>
                  <span>{pantryData?.percentFull || 0}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all" 
                    style={{ width: `${pantryData?.percentFull || 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content: JSON Editor */}
          <div className="lg:col-span-2">
            {selectedBasket ? (
              <Card className="border-border/50 bg-card/50 h-full flex flex-col">
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedBasket(null)}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Database className="h-5 w-5 text-primary" />
                          {selectedBasket}
                        </CardTitle>
                        <CardDescription>View and edit bucket data</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isEditing ? (
                        <Button size="sm" onClick={() => setIsEditing(true)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" onClick={() => {
                            setIsEditing(false)
                            fetchBasketContent(selectedBasket)
                          }}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleSaveBasket} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-4 mt-4 p-2 bg-muted/30 rounded-md">
                      <span className="text-xs font-medium text-muted-foreground">Edit Mode:</span>
                      <div className="flex gap-1">
                        <Button 
                          variant={editMode === 'value' ? 'secondary' : 'ghost'} 
                          size="xs" 
                          className="text-[10px] h-7 px-2"
                          onClick={() => setEditMode('value')}
                        >
                          Values Only
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
                <CardContent className="flex-1 overflow-auto p-6">
                  {loadingBasket ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : editMode === 'full' && isEditing ? (
                    <Textarea 
                      value={JSON.stringify(basketContent, null, 2)}
                      onChange={(e) => {
                        try {
                          setBasketContent(JSON.parse(e.target.value))
                        } catch (err) {
                          // Allow invalid JSON while typing
                        }
                      }}
                      className="font-mono text-sm min-h-[400px] bg-background/50"
                    />
                  ) : (
                    <div className="space-y-4">
                      {basketContent && Object.keys(basketContent).length > 0 ? (
                        renderJsonEditor(basketContent)
                      ) : (
                        <div className="text-center py-20 text-muted-foreground">
                          <p>This bucket is empty.</p>
                          {isEditing && (
                            <Button variant="link" onClick={() => setEditMode('full')} className="mt-2">
                              Switch to Full JSON mode to add data
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-xl p-12 text-center bg-card/30">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Database className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Bucket Selected</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  Select a bucket from the sidebar to view its contents or create a new one to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
