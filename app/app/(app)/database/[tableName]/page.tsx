'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Loader2, Edit, PlusCircle, Trash2, Save, X, ArrowLeft, Eye, Download, Upload, CornerDownLeft, Maximize2, Crop
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from 'next/link'
import { cn } from '@/lib/utils'

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
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropAspect, setCropAspect] = useState<'free' | '1:1' | 'landscape' | 'portrait'>('free');
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  const cropPreviewRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
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
    setIsCropOpen(false);
    setCropAspect('free');
    setCropZoom(1);
    setCropX(0);
    setCropY(0);
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
  const cropAspectClass = {
    'free': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    'landscape': 'aspect-[16/9]',
    'portrait': 'aspect-[3/4]'
  }[cropAspect];

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

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Failed to download file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileUrl.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      setPreviewError('Failed to download file');
    }
  };

  const handleSaveNewUrl = () => {
    if (newFileUrl.trim() && newFileUrl !== fileUrl) {
      onSave(newFileUrl.trim());
    }
  };

  const handleCropImage = async () => {
    setIsCropping(true);
    setPreviewError(null);
    try {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = fileUrl;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Unable to load image for cropping.'));
      });

      const sourceWidth = image.naturalWidth;
      const sourceHeight = image.naturalHeight;
      const sourceAspect = sourceWidth / sourceHeight;
      const targetAspect = cropAspect === '1:1' ? 1 : cropAspect === 'landscape' ? 16 / 9 : cropAspect === 'portrait' ? 3 / 4 : sourceAspect;

      const outputWidth = sourceWidth;
      const outputHeight = Math.round(outputWidth / targetAspect);

      const minZoomForAspect = targetAspect > sourceAspect ? targetAspect / sourceAspect : sourceAspect / targetAspect;
      const safeZoom = Math.max(cropZoom, minZoomForAspect);
      const baseScale = Math.max(outputWidth / sourceWidth, outputHeight / sourceHeight);
      const scale = baseScale * safeZoom;
      const drawnWidth = sourceWidth * scale;
      const drawnHeight = sourceHeight * scale;

      const maxOffsetX = Math.max(0, (drawnWidth - outputWidth) / 2);
      const maxOffsetY = Math.max(0, (drawnHeight - outputHeight) / 2);
      const normalizedX = (cropX / 100) * maxOffsetX;
      const normalizedY = (cropY / 100) * maxOffsetY;

      const dx = (outputWidth - drawnWidth) / 2 - normalizedX;
      const dy = (outputHeight - drawnHeight) / 2 - normalizedY;

      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Unable to create crop canvas.');

      ctx.drawImage(image, dx, dy, drawnWidth, drawnHeight);

      const originalFileName = fileUrl.split('/').pop()?.split('?')[0] || 'image';
      const baseName = originalFileName.replace(/\.[^/.]+$/, '');

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.92));
      if (!blob) throw new Error('Failed to generate cropped image.');

      const croppedFile = new File([blob], `${baseName}-cropped.png`, { type: 'image/png' });
      onUpload(croppedFile);
      setIsCropOpen(false);
    } catch (err) {
      console.error('Crop failed:', err);
      setPreviewError(err instanceof Error ? err.message : 'Failed to crop image');
    } finally {
      setIsCropping(false);
    }
  };

  const clampCropOffset = (value: number) => Math.min(100, Math.max(-100, value));

  const handleCropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: cropX,
      originY: cropY
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCropPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current || !cropPreviewRef.current) return;

    const rect = cropPreviewRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const deltaX = event.clientX - dragStateRef.current.startX;
    const deltaY = event.clientY - dragStateRef.current.startY;
    const nextX = dragStateRef.current.originX + (deltaX / (rect.width / 2)) * 100;
    const nextY = dragStateRef.current.originY + (deltaY / (rect.height / 2)) * 100;

    setCropX(clampCropOffset(nextX));
    setCropY(clampCropOffset(nextY));
  };

  const handleCropPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleCropWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.08 : -0.08;
    setCropZoom((prev) => Math.min(3, Math.max(1, Number((prev + delta).toFixed(2)))));
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
            {fileType === 'image' && (
              <div className="mt-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCropOpen(true)}
                  className="gap-2"
                  disabled={isSaving || isUploading}
                >
                  <Crop className="h-4 w-4" />
                  Crop image
                </Button>
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

      {isCropOpen && fileType === 'image' && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-xl w-full max-w-3xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Crop Image</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCropOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <div
                ref={cropPreviewRef}
                className={cn("w-full border rounded-md bg-black/70 overflow-hidden relative touch-none cursor-grab active:cursor-grabbing", cropAspectClass)}
                onPointerDown={handleCropPointerDown}
                onPointerMove={handleCropPointerMove}
                onPointerUp={handleCropPointerUp}
                onPointerCancel={handleCropPointerUp}
                onWheel={handleCropWheel}
              >
                <img
                  src={fileUrl}
                  alt="Crop preview"
                  className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
                  style={{
                    transform: `translate(${cropX}%, ${cropY}%) scale(${cropZoom})`,
                    transformOrigin: 'center center'
                  }}
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Aspect ratio</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'free', label: 'Custom' },
                      { key: '1:1', label: '1:1' },
                      { key: 'landscape', label: 'Landscape' },
                      { key: 'portrait', label: 'Portrait' },
                    ].map((option) => (
                      <Button
                        key={option.key}
                        size="sm"
                        variant={cropAspect === option.key ? 'default' : 'outline'}
                        onClick={() => setCropAspect(option.key as typeof cropAspect)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Zoom ({cropZoom.toFixed(2)}x)</p>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={cropZoom}
                    onChange={(e) => setCropZoom(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Drag image to reposition. Use mouse wheel or slider to zoom.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCropOpen(false)} disabled={isCropping}>
                Cancel
              </Button>
              <Button onClick={handleCropImage} disabled={isCropping || isUploading} className="gap-2">
                {isCropping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crop className="h-4 w-4" />}
                Apply crop & upload
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Smart Cell Editor Component
interface CellEditorProps {
  value: any;
  onSave: (value: any) => void;
  onCancel: () => void;
  position: DOMRect;
}

function CellEditor({ value, onSave, onCancel, position }: CellEditorProps) {
  const [currentValue, setCurrentValue] = useState(value === null ? '' : String(value));
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

  useEffect(() => {
    if (!position) return;

    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const margin = 16;
    const desiredMaxHeight = 280; // Decreased max height
    const minEditorHeight = 150; // Min height to trigger flip

    const editorWidth = Math.max(position.width, 320);

    let top: number | undefined;
    let bottom: number | undefined;
    let left = position.left;
    let finalMaxHeight: number;

    // Horizontal positioning
    if (left + editorWidth > windowWidth - margin) {
      left = windowWidth - editorWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }

    const spaceBelow = windowHeight - position.bottom - margin;
    const spaceAbove = position.top - margin;

    // Decide whether to open above or below
    if (spaceBelow < minEditorHeight && spaceAbove > spaceBelow) {
      // Open Above
      bottom = windowHeight - position.top;
      finalMaxHeight = Math.min(spaceAbove, desiredMaxHeight);
    } else {
      // Open Below (default)
      top = position.bottom;
      finalMaxHeight = Math.min(spaceBelow, desiredMaxHeight);
    }

    setStyle({
      top,
      bottom,
      left,
      width: editorWidth,
      maxHeight: finalMaxHeight,
      opacity: 1,
    });
    
    textareaRef.current?.focus();

  }, [position]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCancel]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave(currentValue);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      ref={editorRef}
      className="fixed z-[100] bg-background border rounded-lg shadow-xl flex flex-col transition-opacity"
      style={style}
    >
      <div className="p-3 flex-1 flex flex-col gap-3 min-h-0">
        <Textarea
          ref={textareaRef}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 w-full h-full font-mono text-sm resize-none border-0 focus:ring-0 p-0 bg-transparent overflow-y-auto"
        />
        <div className="flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onSave(currentValue)} className="gap-1.5 h-8">
              <CornerDownLeft className="h-3.5 w-3.5" />
              Save changes
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel} className="gap-1.5 h-8 text-muted-foreground">
              <span className="text-[10px] border rounded px-1 py-0.5">Esc</span>
              Cancel changes
            </Button>
          </div>
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

  // States for smart cell editing
  const [activeCell, setActiveCell] = useState<{ rowId: any; col: string; position: any } | null>(null);
  const [isSavingCell, setIsSavingCell] = useState(false);

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
      
      // Update local state instead of full refetch for better UX
      if (action === 'UPDATE_ROW') {
        setTableData(prev => ({
          ...prev,
          data: prev.data.map(row => row.id === payload.rowId ? { ...row, ...payload.updatedData } : row)
        }));
      } else {
        fetchData();
      }
      
      return result;
    } catch (err: any) {
      setError(err.message);
      return Promise.reject(err);
    }
  };
  
  const handleAddRow = async () => {
    await handleApiAction('ADD_ROW', { newRow: {} });
  }

  const handleDeleteRow = async (rowId: any) => {
    if (confirm('Are you sure you want to delete this row?')) {
      await handleApiAction('DELETE_ROW', { rowId });
    }
  };

  const handleCellClick = (e: React.MouseEvent, rowId: any, col: string) => {
    if (!isEditMode || col === 'id' || col === 'created_at') return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setActiveCell({
      rowId,
      col,
      position: rect
    });
  };

  const handleSaveCell = async (newValue: any) => {
    if (!activeCell) return;
    setIsSavingCell(true);
    try {
      await handleApiAction('UPDATE_ROW', {
        rowId: activeCell.rowId,
        updatedData: { [activeCell.col]: newValue }
      });
      setActiveCell(null);
    } catch (err) {
      console.error('Failed to save cell:', err);
    } finally {
      setIsSavingCell(false);
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
      if (!response.ok) throw new Error(result.error || 'Failed to upload file');

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

  const isFileColumn = (column: string): boolean => storageColumns.includes(column);

  const isUrl = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const renderCellContent = (row: Record<string, any>, col: string) => {
    const value = row[col];
    
    if (value === null) return <span className="text-muted-foreground italic text-xs">NULL</span>;
    
    if (isFileColumn(col) && isUrl(value)) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenFilePreview(row, col);
          }}
          className="gap-2 h-6 text-[10px] px-2"
        >
          <Eye className="h-3 w-3" />
          View
        </Button>
      );
    }

    if (typeof value === 'object') return JSON.stringify(value);
    
    const strValue = String(value);
    if (strValue.trim() === "") return <span className="text-muted-foreground/30 italic text-xs">empty</span>;
    
    return strValue;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-full mx-auto">
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
            <Button onClick={handleAddRow}>
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
            
            <div className="border border-border/50 rounded-lg bg-card/50 overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="border-collapse table-fixed w-full">
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      {tableData.columns.map(col => (
                        <TableHead 
                          key={col} 
                          className="text-xs font-semibold border-r border-border/50 last:border-r-0 h-10 px-3 truncate"
                          style={{ width: col === 'id' ? '80px' : '200px' }}
                        >
                          <div className="flex items-center justify-between">
                            <span>{col}</span>
                            <span className="text-[10px] text-muted-foreground font-normal ml-2">text</span>
                          </div>
                        </TableHead>
                      ))}
                      {isEditMode && <TableHead className="w-[80px] text-center">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={tableData.columns.length + (isEditMode ? 1: 0)} className="text-center py-20 text-muted-foreground">
                          This table is empty.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tableData.data.map((row) => (
                        <TableRow key={row.id} className="hover:bg-muted/20 transition-colors group">
                          {tableData.columns.map(col => (
                            <TableCell 
                              key={col} 
                              className={cn(
                                "py-0 px-0 border-r border-border/50 last:border-r-0 h-10 relative",
                                isEditMode && col !== 'id' && col !== 'created_at' && "cursor-pointer hover:bg-blue-500/5"
                              )}
                              onClick={(e) => handleCellClick(e, row.id, col)}
                            >
                              <div className="px-3 py-2 truncate text-xs font-mono h-full flex items-center">
                                {renderCellContent(row, col)}
                              </div>
                            </TableCell>
                          ))}
                          {isEditMode && (
                            <TableCell className="text-center py-0 px-0">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleDeleteRow(row.id)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-4 w-4"/>
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Smart Cell Editor */}
      {activeCell && (
        <CellEditor
          value={tableData.data.find(r => r.id === activeCell.rowId)?.[activeCell.col]}
          onSave={handleSaveCell}
          onCancel={() => setActiveCell(null)}
          position={activeCell.position}
        />
      )}

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
