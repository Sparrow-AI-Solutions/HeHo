'use client'

import { useEffect, useState } from 'react'
import { createClient } from "@/lib/supabase/client"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Loader2, Database as DatabaseIcon, Zap, CheckCircle, Database, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// The four default tables.
const DEFAULT_TABLES = [
  { id: 'default-products', table_name: 'products' },
  { id: 'default-leads', table_name: 'leads' },
  { id: 'default-customer_queries', table_name: 'customer_queries' },
  { id: 'default-sales', table_name: 'sales' },
];

interface ConnectedTable {
  id: string;
  table_name: string;
}

export default function DatabasePage() {
  const [customTables, setCustomTables] = useState<ConnectedTable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchCustomTables() {
      setLoading(true)
      setError(null)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          throw new Error("You must be logged in to view this page.");
        }

        const { data, error } = await supabase
          .from('user_connected_tables')
          .select('id, table_name')
          .eq('user_id', user.id)

        if (error) {
          throw new Error(`Failed to load connected tables: ${error.message}.`);
        }

        setCustomTables(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomTables()
  }, [supabase])

  // Create a unique list of all tables.
  const allTablesMap = new Map();
  [...DEFAULT_TABLES, ...customTables].forEach(table => allTablesMap.set(table.table_name, { id: table.id || table.table_name, ...table }));
  const allTables = Array.from(allTablesMap.values());

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Database</h1>
            <p className="text-xs sm:text-base text-muted-foreground mt-1">Manage tables in your database.</p>
          </div>
          
          {/* Desktop buttons - hidden on mobile */}
          <div className="hidden sm:flex gap-2">
            <Button asChild variant="outline" className="border-border h-9 sm:h-10">
              <Link href="/app/database/create"><Database className="mr-2 h-4 w-4"/> Create a Table</Link>
            </Button>
            <Button asChild className="bg-foreground hover:bg-muted text-background border border-border h-9 sm:h-10">
              <Link href="/app/database/connect"><Plus className="mr-2 h-4 w-4"/> Connect a Table</Link>
            </Button>
          </div>

          {/* Mobile dropdown menu - shown only on mobile */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full bg-foreground hover:bg-muted text-background border border-border h-9 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Table
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/app/database/create" className="flex items-center gap-2 cursor-pointer">
                    <Database className="h-4 w-4" />
                    Create a Table
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/app/database/connect" className="flex items-center gap-2 cursor-pointer">
                    <Plus className="h-4 w-4" />
                    Connect a Table
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {allTables.map(table => {
            return (
              <Link key={table.id} href={`/app/database/${encodeURIComponent(table.table_name)}`} passHref>
                <Card className="border-border/50 bg-card hover:border-foreground/30 hover:bg-card/80 transition-all cursor-pointer h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-foreground flex items-center gap-3 text-base sm:text-lg">
                      <DatabaseIcon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground"/>
                      <span className="truncate">{table.table_name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <p className="text-muted-foreground text-xs sm:text-sm">Click to view and edit this table's data.</p>
                    <div className="mt-4 p-2 rounded-md bg-green-500/10 border border-green-500/50 text-green-500 text-[10px] sm:text-xs flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0"/>
                        <span>Full CRUD operations enabled.</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
