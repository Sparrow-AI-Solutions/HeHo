'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Loader2,
  Package as PackageIcon,
  CheckCircle,
  Database as DatabaseIcon,
  Link2,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Basket {
  name: string
  ttl: number
}

export default function PantryPage() {
  const router = useRouter()
  const supabase = createClient()

  const [pantryId, setPantryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [baskets, setBaskets] = useState<Basket[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [bucketDialogOpen, setBucketDialogOpen] = useState(false)
  const [bucketDialogMode, setBucketDialogMode] = useState<'create' | 'connect'>('create')
  const [bucketDialogValue, setBucketDialogValue] = useState('')

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          throw new Error('Authentication failed')
        }

        const { data, error: dbError } = await supabase
          .from('users')
          .select('pantry_id')
          .eq('id', user.id)
          .single()

        if (dbError) {
          throw new Error('Failed to load Pantry ID')
        }

        if (!data?.pantry_id) {
          setPantryId(null)
          return
        }

        setPantryId(data.pantry_id)
        await fetchBaskets()
      } catch (err: any) {
        setError(err.message || 'Failed to load Pantry')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [supabase])

  const fetchBaskets = async () => {
    const response = await fetch('/api/pantry/buckets')

    if (!response.ok) {
      const text = await response.text()
      const errorData = text ? JSON.parse(text) : { error: 'Unknown error' }
      throw new Error(errorData.error || 'Failed to fetch buckets')
    }

    const text = await response.text()
    const result = text ? JSON.parse(text) : { data: [] }
    setBaskets(result.data || [])
  }

  const openBucketDialog = (mode: 'create' | 'connect') => {
    setBucketDialogMode(mode)
    setBucketDialogValue('')
    setBucketDialogOpen(true)
  }

  const closeBucketDialog = () => {
    if (isCreating || isConnecting) return
    setBucketDialogOpen(false)
    setBucketDialogValue('')
  }

  const openBucketPage = (bucketName: string) => {
    router.push(`/app/pantry/${encodeURIComponent(bucketName)}`)
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
        body: JSON.stringify({ basket: bucketName }),
      })

      if (!response.ok) {
        const text = await response.text()
        const errorData = text ? JSON.parse(text) : { error: 'Unknown error' }
        throw new Error(errorData.error || 'Failed to create bucket')
      }

      setBucketDialogOpen(false)
      setBucketDialogValue('')
      toast.success(`Bucket "${bucketName}" created`)
      await fetchBaskets()
      openBucketPage(bucketName)
    } catch (err: any) {
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
      const response = await fetch(`/api/pantry?basket=${encodeURIComponent(bucketName)}`)
      if (!response.ok) {
        const text = await response.text()
        const errorData = text ? JSON.parse(text) : { error: 'Unknown error' }
        throw new Error(errorData.error || 'Failed to open bucket')
      }

      setBucketDialogOpen(false)
      setBucketDialogValue('')
      toast.success(`Bucket "${bucketName}" opened`)
      openBucketPage(bucketName)
    } catch (err: any) {
      toast.error(err.message || 'Failed to open bucket')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDeleteBucket = async (bucketName: string) => {
    if (!confirm(`Are you sure you want to delete the bucket "${bucketName}"?`)) return

    setIsDeleting(bucketName)
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
      setBaskets((current) => current.filter((bucket) => bucket.name !== bucketName))
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete bucket')
    } finally {
      setIsDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    )
  }

  if (!pantryId) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <Alert>
            <AlertDescription>Connect your Pantry ID in settings before managing buckets.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Pantry</h1>
            <p className="text-xs sm:text-base text-muted-foreground mt-1">Manage JSON buckets in your pantry.</p>
          </div>

          <div className="hidden sm:flex gap-2">
            <Button variant="outline" className="border-border h-9 sm:h-10" onClick={() => openBucketDialog('create')}>
              <PackageIcon className="mr-2 h-4 w-4" /> Create a Bucket
            </Button>
            <Button className="bg-foreground hover:bg-muted text-background border border-border h-9 sm:h-10" onClick={() => openBucketDialog('connect')}>
              <Plus className="mr-2 h-4 w-4" /> Connect a Bucket
            </Button>
          </div>

          <div className="sm:hidden flex flex-col gap-2 w-full">
            <Button variant="outline" className="w-full border-border h-9" onClick={() => openBucketDialog('create')}>
              <PackageIcon className="mr-2 h-4 w-4" /> Create a Bucket
            </Button>
            <Button className="w-full bg-foreground hover:bg-muted text-background border border-border h-9" onClick={() => openBucketDialog('connect')}>
              <Plus className="mr-2 h-4 w-4" /> Connect a Bucket
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {baskets.length > 0 ? (
            baskets.map((bucket) => (
              <div key={bucket.name} className="relative">
                <Card
                  className="border-border/50 bg-card hover:border-foreground/30 hover:bg-card/80 transition-all cursor-pointer h-full flex flex-col"
                  onClick={() => openBucketPage(bucket.name)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-foreground flex items-center gap-3 text-base sm:text-lg">
                      <DatabaseIcon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      <span className="truncate">{bucket.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <p className="text-muted-foreground text-xs sm:text-sm">Click to view and edit this bucket&apos;s data.</p>
                    <div className="mt-4 p-2 rounded-md bg-green-500/10 border border-green-500/50 text-green-500 text-[10px] sm:text-xs flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span>Open separate editor page.</span>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteBucket(bucket.name)
                  }}
                  disabled={isDeleting === bucket.name}
                  className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 bg-background/80 backdrop-blur-sm"
                >
                  {isDeleting === bucket.name ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-xl p-12 text-center bg-card/30">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <DatabaseIcon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Buckets Found</h3>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm">Create a new bucket or connect an existing one to get started.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={bucketDialogOpen} onOpenChange={(open) => { if (!open) closeBucketDialog() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{bucketDialogMode === 'create' ? 'Create Bucket' : 'Connect Bucket'}</DialogTitle>
            <DialogDescription>
              {bucketDialogMode === 'create'
                ? 'Enter the new pantry bucket name you want to create.'
                : 'Enter the pantry bucket name you want to open.'}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={bucketDialogValue}
            onChange={(e) => setBucketDialogValue(e.target.value)}
            placeholder={bucketDialogMode === 'create' ? 'new-bucket-name' : 'existing-bucket-name'}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (bucketDialogMode === 'create') handleCreateBucket()
                else handleConnectBucket()
              }
            }}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={closeBucketDialog} disabled={isCreating || isConnecting}>Cancel</Button>
            <Button onClick={bucketDialogMode === 'create' ? handleCreateBucket : handleConnectBucket} disabled={!bucketDialogValue.trim() || isCreating || isConnecting}>
              {bucketDialogMode === 'create' ? (
                isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PackageIcon className="h-4 w-4 mr-2" />
              ) : (
                isConnecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />
              )}
              {bucketDialogMode === 'create' ? 'Create Bucket' : 'Open Bucket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
