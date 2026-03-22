'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Database as DatabaseIcon, Edit2, Loader2, Save, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function PantryBucketPage() {
  const params = useParams<{ bucketName: string }>()
  const bucketName = decodeURIComponent(params.bucketName)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bucketContent, setBucketContent] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editMode, setEditMode] = useState<'value' | 'full'>('value')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchBucketContent()
  }, [bucketName])

  const fetchBucketContent = async () => {
    setLoading(true)
    setError(null)
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
      setIsEditing(false)
      setEditMode('value')
    } catch (err: any) {
      setError(err.message || 'Failed to load bucket')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBucket = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basket: bucketName, data: bucketContent || {} }),
      })

      if (!response.ok) {
        const text = await response.text()
        const errorData = text ? JSON.parse(text) : { error: 'Unknown error' }
        throw new Error(errorData.error || 'Failed to save bucket')
      }

      toast.success('Bucket saved successfully')
      setIsEditing(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save bucket')
    } finally {
      setIsSaving(false)
    }
  }

  const updateValue = (path: string[], value: any) => {
    const newContent = { ...(bucketContent || {}) }
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
            value={obj === null ? 'null' : String(obj ?? '')}
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

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-full mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/app/pantry">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pantry
            </Link>
          </Button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{bucketName}</h1>
            <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? 'secondary' : 'default'}>
              {isEditing ? <><X className="h-4 w-4 mr-2" />Exit Edit Mode</> : <><Edit2 className="h-4 w-4 mr-2" />Edit Data</>}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <>
            {error && <Alert variant="destructive" className="mb-4"><AlertTitle>Action Failed</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

            <Card className="border border-border/50 rounded-lg bg-card/50 overflow-hidden">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                      <DatabaseIcon className="h-5 w-5 text-primary" />
                      {bucketName}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing && (
                      <>
                        <Button variant="outline" size="sm" onClick={fetchBucketContent}>
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
                      <Button variant={editMode === 'value' ? 'secondary' : 'ghost'} size="sm" className="text-[10px] h-7 px-2" onClick={() => setEditMode('value')}>
                        Values
                      </Button>
                      <Button variant={editMode === 'full' ? 'secondary' : 'ghost'} size="sm" className="text-[10px] h-7 px-2" onClick={() => setEditMode('full')}>
                        Full JSON
                      </Button>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6 max-h-[600px] overflow-auto">
                {editMode === 'full' && isEditing ? (
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
          </>
        )}
      </div>
    </div>
  )
}
