'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, Trash2, ArrowLeft } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from 'next/link'

interface Column {
  name: string;
  type: string;
  primaryKey: boolean;
  notNull: boolean;
  defaultValue: string;
}

const DATA_TYPES = [
  { value: 'uuid', label: 'UUID' },
  { value: 'text', label: 'Text' },
  { value: 'integer', label: 'Integer' },
  { value: 'bigint', label: 'BigInt' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'timestamp with time zone', label: 'Timestamp (TZ)' },
  { value: 'jsonb', label: 'JSONB' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'float8', label: 'Float8' },
];

export default function CreateTablePage() {
  const [tableName, setTableName] = useState('')
  const [columns, setColumns] = useState<Column[]>([
    { name: 'id', type: 'uuid', primaryKey: true, notNull: true, defaultValue: 'gen_random_uuid()' },
    { name: 'created_at', type: 'timestamp with time zone', primaryKey: false, notNull: true, defaultValue: 'now()' },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const addColumn = () => {
    setColumns([...columns, { name: '', type: 'text', primaryKey: false, notNull: false, defaultValue: '' }])
  }

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index))
  }

  const updateColumn = (index: number, field: keyof Column, value: any) => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    setColumns(newColumns)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!tableName.trim()) {
      setError("Table name cannot be empty.");
      setLoading(false);
      return;
    }

    if (columns.some(col => !col.name.trim())) {
      setError("All columns must have a name.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/database/create-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, columns }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.')
      }

      setSuccess(`Successfully created table "${tableName}". Redirecting...`)
      setTimeout(() => {
        router.push('/app/database')
      }, 2000)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/app/database">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Database
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Create New Table</h1>
          <p className="text-muted-foreground">Define your table schema and create it directly in your Supabase project.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Table Settings</CardTitle>
              <CardDescription>Give your table a name (it will be created in the public schema).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-sm font-medium">Table Name</label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">public.</span>
                  <Input
                    placeholder="e.g., customers"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    disabled={loading}
                    className="bg-background border-border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Columns</CardTitle>
                <CardDescription>Define the columns for your table.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addColumn} disabled={loading}>
                <Plus className="mr-2 h-4 w-4" /> Add Column
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {columns.map((column, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b border-border/30 pb-4 last:border-0">
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Name</label>
                    <Input
                      placeholder="column_name"
                      value={column.name}
                      onChange={(e) => updateColumn(index, 'name', e.target.value)}
                      disabled={loading}
                      className="h-9"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Type</label>
                    <Select
                      value={column.type}
                      onValueChange={(value) => updateColumn(index, 'type', value)}
                      disabled={loading}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DATA_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Default Value</label>
                    <Input
                      placeholder="NULL"
                      value={column.defaultValue}
                      onChange={(e) => updateColumn(index, 'defaultValue', e.target.value)}
                      disabled={loading}
                      className="h-9"
                    />
                  </div>
                  <div className="md:col-span-1 flex flex-col items-center justify-center gap-1">
                    <label className="text-[10px] font-medium text-muted-foreground">PK</label>
                    <Checkbox
                      checked={column.primaryKey}
                      onCheckedChange={(checked) => updateColumn(index, 'primaryKey', checked)}
                      disabled={loading}
                    />
                  </div>
                  <div className="md:col-span-1 flex flex-col items-center justify-center gap-1">
                    <label className="text-[10px] font-medium text-muted-foreground">NotNull</label>
                    <Checkbox
                      checked={column.notNull}
                      onCheckedChange={(checked) => updateColumn(index, 'notNull', checked)}
                      disabled={loading}
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeColumn(index)}
                      disabled={loading || columns.length <= 1}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 w-9"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500/50 bg-green-500/10 text-green-500">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button type="submit" className="flex-1 bg-foreground text-background hover:bg-muted" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Table'}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
