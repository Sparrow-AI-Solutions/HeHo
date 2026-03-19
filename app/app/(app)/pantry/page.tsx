'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Package, Settings, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function PantryPage() {
  const [pantryId, setPantryId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchPantryStatus = async () => {
      setLoading(true)
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError) {
        setError("Could not authenticate user.")
        setLoading(false)
        return
      }

      if (user) {
        const { data, error: dbError } = await supabase
          .from('users')
          .select('pantry_id')
          .eq('id', user.id)
          .single()

        if (dbError) {
          // Don't throw an error if the user row doesn't exist yet, just treat as not connected
          if (dbError.code !== 'PGRST116') { 
             setError("Failed to fetch Pantry status.")
          }
          setPantryId(null)
        } else {
          setPantryId(data?.pantry_id || null)
        }
      }
      setLoading(false)
    }

    fetchPantryStatus()
  }, [supabase])

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Package className="h-6 w-6" />
            Pantry Status
          </CardTitle>
          <CardDescription>
            Manage your Pantry connection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Checking Pantry connection...</p>
            </div>
          ) : error ? (
             <div className="flex flex-col items-center justify-center py-8 text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p className="mt-4 text-center">{error}</p>
            </div>
          ) : pantryId ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold text-green-400">Pantry is Connected</h3>
              <p className="text-muted-foreground mt-2">Welcome! Your Pantry is linked and ready to use.</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold">Pantry Not Connected</h3>
              <p className="text-muted-foreground mt-2 mb-6">To use the Pantry features, you need to connect your Pantry ID in the settings.</p>
              <Button asChild>
                <Link href="/app/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Go to Settings
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
