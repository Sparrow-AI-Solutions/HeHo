'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Loader2, Edit, PlusCircle, Trash2, Save, X, ArrowLeft, Eye, Download, Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from 'next/link'

interface TableData {
  columns: string[];
  data: Record<string, any>[];
}

interface FilePreviewModalProps {
  isOpen: boolean;
  fileUrl: string;
  onClose: () => void;
  onSave: (newUrl: string) => void;
  onUpload: (file: File) => void;
  isSaving: boolean;
  isUploading: boolean;
  bucketName: string;
}

const debounce = <F extends (...args: any[]) => void>(func: F, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// File Preview Modal Component
function FilePreviewModal({ isOpen, fileUrl, onClose, onSave, onUpload, isSaving, isUploading, bucketName }: FilePreviewModalProps) {
  const [newFileUrl, setNewFileUrl] = useState(fileUrl);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState(false);
  const fileInputRef = useCallback((input: HTMLInputElement | null) => {
    if (input) {
      input.addEventListener('change', (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          onUpload(file);
        }
      });
    }
  }, [onUpload]);

  useEffect(() => {
    setNewFileUrl(fileUrl);
    setPreviewError(null);
    setUploadMode(false);
  }, [fileUrl, isOpen]);

  if (!isOpen) return null;

  const getFileExtension = (url: string) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      return path.split('.').pop()?.toLowerCase() || '';
    } catch {
      return '';
    }
  };

  const getFileType = (url: string) => {
    const ext = getFileExtension(url);
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'document';
    if (['txt', 'md'].includes(ext)) return 'text';
    return 'file';
  };

  const fileType = getFileType(fileUrl);

  const renderPreview = () => {
    switch (fileType) {
      case 'image':
        return (
          <img 
            src={fileUrl} 
            alt="Preview" 
            className="max-w-full max-h-96 object-contain rounded"
            onError={() => setPreviewError('Failed to load image')}
          />
        );
      case 'pdf':
        return (
          <div className="w-full h-96 border rounded">
            <iframe 
              src={`${fileUrl}#toolbar=0`} 
              className="w-full h-full rounded"
              title="PDF Preview"
              onError={() => setPreviewError('Failed to load PDF')}
            />
          </div>
        );
      case 'document':
        return (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">Document preview not available in browser</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Download the file to view it</p>
          </div>
        );
      case 'text':
        return (
          <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded border max-h-96 overflow-auto">
            <p className="text-xs text-muted-foreground">Text preview loading...</p>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded border">
            <p className="text-sm text-muted-foreground">File type: {fileType}</p>
          </div>
        );
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileUrl.split('/').pop() || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveNewUrl = () => {
    if (newFileUrl.trim() && newFileUrl !== fileUrl) {
      onSave(newFileUrl.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
          <h2 className="text-lg font-semibold">File Preview & Edit</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Preview Section */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <p className="text-xs font-semibold text-muted-foreground mb-3">PREVIEW</p>
            {previewError ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">{previewError}</p>
              </div>
            ) : (
              <div className="flex justify-center">
                {renderPreview()}
              </div>
            )}
          </div>

          {/* File URL Display */}
          <div className="border rounded-lg p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">CURRENT FILE URL</p>
            <div className="p-2 bg-muted rounded text-xs break-all font-mono text-muted-foreground max-h-20 overflow-auto">
              {fileUrl}
            </div>
          </div>

          {/* Edit Section - Toggle between URL and Upload */}
          <div className="border rounded-lg p-4 bg-blue-50/50 dark:bg-blue-950/30">
            <div className="flex gap-2 mb-3">
              <Button 
                size="sm" 
                variant={uploadMode ? "outline" : "default"}
                onClick={() => setUploadMode(false)}
              >
                Edit URL
              </Button>
              <Button 
                size="sm" 
                variant={uploadMode ? "default" : "outline"}
                onClick={() => setUploadMode(true)}
              >
                Upload File
              </Button>
            </div>

            {uploadMode ? (
              // File Upload Mode
              <div className="space-y-3">
                <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="file-upload"
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="cursor-pointer block"
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {isUploading ? 'Uploading...' : 'Click to upload a new file'}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      File will be saved to: <strong>{bucketName}</strong>
                    </p>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select a file to upload. It will replace the current file in your storage bucket.
                </p>
              </div>
            ) : (
              // URL Edit Mode
              <div className="space-y-2">
                <Input
                  placeholder="Enter new file URL or paste updated link"
                  value={newFileUrl}
                  onChange={(e) => setNewFileUrl(e.target.value)}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Paste a new file link from your storage bucket
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-2 p-4 border-t bg-background/95 backdrop-blur justify-end flex-wrap">
          <Button variant="outline" onClick={onClose} disabled={isSaving || isUploading}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleDownload} disabled={isSaving || isUploading} className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
          {!uploadMode && (
            <Button 
              onClick={handleSaveNewUrl} 
              disabled={isSaving || !newFileUrl.trim() || newFileUrl === fileUrl}
              className="gap-2"
            >
              {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
              Save URL
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TableViewPage() {
  const params = useParams()
  const tableName = decodeURIComponent(params.tableName as string)
  const [tableData, setTableData] = useState<TableData>({ columns: [], data: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // States for inline editing
  const [editingRowId, setEditingRowId] = useState<any>(null);
  const [editingRowData, setEditingRowData] = useState<Record<string, any> | null>(null);

  // States for file preview modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<any>(null);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [isSavingFile, setIsSavingFile] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Storage columns state
  const [storageColumns, setStorageColumns] = useState<string[]>([]);
  const [storageBucket, setStorageBucket] = useState<string>("");

  // Success state
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/database/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unknown error')
      setTableData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tableName])

  // Fetch storage columns and bucket from user settings
  const fetchStorageConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/database/get-storage-columns', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        const result = await response.json()
        setStorageColumns(result.storageColumns || [])
        setStorageBucket(result.storageBucket || "")
      }
    } catch (err) {
      console.error('Failed to fetch storage config:', err)
    }
  }, [])

  useEffect(() => {
    if (tableName) {
      fetchData()
      fetchStorageConfig()
    }
  }, [tableName, fetchData, fetchStorageConfig])

  const debouncedRefetch = useCallback(debounce(() => { 
    setEditingRowId(null);
    fetchData();
  }, 300), [fetchData]);

  const handleApiAction = async (action: string, payload: any) => {
    setError(null);
    try {
      const response = await fetch('/api/database/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, action, payload }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      debouncedRefetch();
      return result;
    } catch (err: any) {
      setError(err.message);
      return Promise.reject(err);
    }
  };
  
  const handleAddRow = async () => {
    await handleApiAction('ADD_ROW', { newRow: {} });
  }

  const handleEditRow = (row: Record<string, any>) => {
    setEditingRowId(row.id);
    setEditingRowData({ ...row });
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingRowData(null);
    setError(null);
  }

  const handleSaveEdit = async () => {
    if (!editingRowData) return;
    await handleApiAction('UPDATE_ROW', { rowId: editingRowId, updatedData: editingRowData });
  }

  const handleDeleteRow = async (rowId: any) => {
    if (confirm('Are you sure you want to delete this row?')) {
      await handleApiAction('DELETE_ROW', { rowId });
    }
  };

  const handleOpenFilePreview = (row: Record<string, any>, column: string) => {
    const fileUrl = row[column];
    if (fileUrl && typeof fileUrl === 'string') {
      setSelectedFileUrl(fileUrl);
      setSelectedRowId(row.id);
      setSelectedColumn(column);
      setIsModalOpen(true);
    }
  };

  const handleSaveFileUrl = async (newUrl: string) => {
    if (!selectedRowId || !selectedColumn) return;
    
    setIsSavingFile(true);
    try {
      await handleApiAction('UPDATE_ROW', {
        rowId: selectedRowId,
        updatedData: { [selectedColumn]: newUrl }
      });
      setSelectedFileUrl(newUrl);
      setSuccess('File link updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to save file URL:', err);
    } finally {
      setIsSavingFile(false);
    }
  };

  const handleUploadFile = async (file: File) => {
    if (!selectedRowId || !selectedColumn || !storageBucket) return;

    setIsUploadingFile(true);
    try {
      // Generate a unique file path
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `${timestamp}-${randomStr}-${file.name}`;
      const filePath = `${selectedColumn}/${fileName}`;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucketName', storageBucket);
      formData.append('filePath', filePath);

      const response = await fetch('/api/database/upload-file', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload file');
      }

      // Save the new file URL to the database
      await handleApiAction('UPDATE_ROW', {
        rowId: selectedRowId,
        updatedData: { [selectedColumn]: result.fileUrl }
      });

      setSelectedFileUrl(result.fileUrl);
      setSuccess('File uploaded and saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const isFileColumn = (column: string): boolean => {
    return storageColumns.includes(column);
  };

  const isUrl = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const renderCell = (row: Record<string, any>, col: string) => {
    const isEditingThisRow = editingRowId === row.id;
    const data = isEditingThisRow ? editingRowData : row;

    if (isEditingThisRow && col !== 'id' && col !== 'created_at') {
      return (
        <Input
          value={editingRowData?.[col] || ''}
          onChange={(e) => setEditingRowData(prev => prev ? { ...prev, [col]: e.target.value } : null)}
          className="bg-background/80 h-8 text-xs"
        />
      )
    }

    if (data[col] === null) return <span className="text-muted-foreground">NULL</span>;
    if (typeof data[col] === 'object') return <pre className="text-xs max-w-xs truncate">{JSON.stringify(data[col])}</pre>;
    
    const cellValue = String(data[col]);
    if (cellValue.trim() === "") return <span className="text-muted-foreground/50 italic">‹empty›</span>

    // Check if this is a storage column with a URL
    if (isFileColumn(col) && isUrl(cellValue)) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenFilePreview(row, col)}
          className="gap-2 h-7 text-xs"
        >
          <Eye className="h-3 w-3" />
          View
        </Button>
      );
    }

    return cellValue;
  }

  const isAnythingBeingEdited = editingRowId !== null;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/app/database">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Database
            </Link>
          </Button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{tableName}</h1>
            <Button onClick={() => setIsEditMode(!isEditMode)} variant={isEditMode ? 'secondary' : 'default'}>
              {isEditMode ? <><X className="h-4 w-4 mr-2"/>Exit Edit Mode</> : <><Edit className="h-4 w-4 mr-2"/>Edit Data</>}
            </Button>
          </div>
        </div>

        {isEditMode && (
          <div className="mb-4">
            <Button onClick={handleAddRow} disabled={isAnythingBeingEdited}>
              <PlusCircle className="h-4 w-4 mr-2"/>Add New Row
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <> 
            {error && <Alert variant="destructive" className="mb-4"><AlertTitle>Action Failed</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert className="mb-4 border-green-500/50 bg-green-500/10"><AlertTitle>Success</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}
            <div className="border border-border/50 rounded-lg bg-card/50 overflow-x-auto">
              <Table>
                <TableHeader><TableRow>{tableData.columns.map(col => <TableHead key={col} className="text-xs sm:text-sm">{col}</TableHead>)}{isEditMode && <TableHead className="text-right min-w-[100px]">Actions</TableHead>}</TableRow></TableHeader>
                <TableBody>
                  {tableData.data.length === 0 ? (
                    <TableRow><TableCell colSpan={tableData.columns.length + (isEditMode ? 1: 0)} className="text-center py-20 text-muted-foreground">This table is empty.</TableCell></TableRow>
                  ) : (
                    tableData.data.map((row) => (
                      <TableRow key={row.id}>
                        {tableData.columns.map(col => <TableCell className="py-2 text-xs sm:text-sm" key={col}>{renderCell(row, col)}</TableCell>)}
                        {isEditMode && (
                          <TableCell className="text-right py-2">
                            {editingRowId === row.id ? (
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" onClick={handleSaveEdit}><Save className="h-4 w-4"/></Button>
                                <Button size="sm" variant="outline" onClick={handleCancelEdit}><X className="h-4 w-4"/></Button>
                              </div>
                            ) : (
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="outline" onClick={() => handleEditRow(row)} disabled={isAnythingBeingEdited}><Edit className="h-4 w-4"/></Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteRow(row.id)} disabled={isAnythingBeingEdited}><Trash2 className="h-4 w-4"/></Button>
                              </div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={isModalOpen}
        fileUrl={selectedFileUrl}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFileUrl}
        onUpload={handleUploadFile}
        isSaving={isSavingFile}
        isUploading={isUploadingFile}
        bucketName={storageBucket}
      />
    </div>
  )
}
