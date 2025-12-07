import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FolderOpen, X, AlertTriangle } from 'lucide-react';
import { VideoIcon } from 'lucide-react';
import type { Media } from '@/types';

interface MediaSelectorProps {
  canAddMedia: boolean;
  allowedMediaTypes: string[];
  selectedLibraryMedia: string[];
  uploadedFiles: File[];
  libraryMedia: Media[];
  onOpenLibrary: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveLibraryMedia: (mediaId: string) => void;
  onRemoveUploadedFile: (index: number) => void;
  loading?: boolean;
}

export function MediaSelector({
  canAddMedia,
  allowedMediaTypes,
  selectedLibraryMedia,
  uploadedFiles,
  libraryMedia,
  onOpenLibrary,
  onFileSelect,
  onRemoveLibraryMedia,
  onRemoveUploadedFile,
  loading = false,
}: MediaSelectorProps) {
  const totalMediaCount = uploadedFiles.length + selectedLibraryMedia.length;

  if (!canAddMedia) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Media not supported by selected platform
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onOpenLibrary}
          disabled={loading}
          className="flex-1"
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          From Library
        </Button>

        <Button
          variant="outline"
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={loading}
          className="flex-1"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Files
        </Button>
        <input
          id="file-upload"
          type="file"
          multiple
          accept={allowedMediaTypes.map(t => `${t}/*`).join(',')}
          onChange={onFileSelect}
          className="hidden"
        />
      </div>

      {/* Display selected media */}
      {totalMediaCount > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">
            Selected Media ({totalMediaCount})
          </p>
          <div className="grid grid-cols-4 gap-2">
            {/* Library media */}
            {libraryMedia
              .filter(m => selectedLibraryMedia.includes(m._id))
              .map(m => (
                <div key={m._id} className="relative aspect-square rounded-lg overflow-hidden border">
                  {m.type === 'image' ? (
                    <img src={m.s3Url} alt={m.altText || m.filename} className="h-full w-full object-cover" />
                  ) : (
                    <video src={`${m.s3Url}#t=0.1`} className="h-full w-full object-cover" muted />
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => onRemoveLibraryMedia(m._id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Badge className="absolute bottom-1 left-1 text-xs">
                    Library
                  </Badge>
                </div>
              ))}

            {/* Uploaded files */}
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                {file.type.startsWith('image/') ? (
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={file.name} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <VideoIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => onRemoveUploadedFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <Badge className="absolute bottom-1 left-1 text-xs">
                  Upload
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}