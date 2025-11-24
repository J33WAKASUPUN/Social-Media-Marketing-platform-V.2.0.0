import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: FileList, metadata: {
    folder?: string;
    tags?: string[];
    altText?: string;
    caption?: string;
  }) => void;
  uploading: boolean;
  uploadProgress: number;
  folders: string[];
  popularTags: string[];
}

export function UploadDialog({
  open,
  onOpenChange,
  onUpload,
  uploading,
  uploadProgress,
  folders,
  popularTags,
}: UploadDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [metadata, setMetadata] = useState({
    folder: 'Default',
    tags: [] as string[],
    altText: '',
    caption: '',
  });
  const [tagInput, setTagInput] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleAddTag = () => {
    if (tagInput && !metadata.tags.includes(tagInput)) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleUpload = () => {
    if (selectedFiles) {
      onUpload(selectedFiles, metadata);
      // Reset form
      setSelectedFiles(null);
      setMetadata({
        folder: 'Default',
        tags: [],
        altText: '',
        caption: '',
      });
      setTagInput('');
    }
  };

  const handleClose = () => {
    setSelectedFiles(null);
    setMetadata({
      folder: 'Default',
      tags: [],
      altText: '',
      caption: '',
    });
    setTagInput('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Upload images or videos to your media library
          </DialogDescription>
        </DialogHeader>

        {uploading ? (
          <div className="space-y-4 py-8">
            <p className="text-center text-sm text-muted-foreground">
              Uploading files...
            </p>
            <Progress value={uploadProgress} />
            <p className="text-center text-xs text-muted-foreground">
              {uploadProgress}%
            </p>
          </div>
        ) : !selectedFiles ? (
          <div
            className={cn(
              "rounded-lg border-2 border-dashed p-8 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-muted"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">
              Drag and drop files here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse
            </p>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Browse Files
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">
              Max file size: 50MB • Supported: JPG, PNG, GIF, WebP, MP4, MOV
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected Files Preview */}
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-2">
                Selected Files ({selectedFiles.length})
              </p>
              <div className="space-y-1">
                {Array.from(selectedFiles).map((file, index) => (
                  <p key={index} className="text-xs text-muted-foreground truncate">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setSelectedFiles(null)}
              >
                Change Files
              </Button>
            </div>

            {/* Metadata Form */}
            <div className="space-y-4">
              {/* Folder Selection */}
              <div className="space-y-2">
                <Label>Folder (Optional)</Label>
                <Select value={metadata.folder} onValueChange={(v) => setMetadata(prev => ({ ...prev, folder: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select folder or leave default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Default">Default</SelectItem>
                    {folders.filter(f => f && f !== 'Default').map((folder) => (
                      <SelectItem key={folder} value={folder}>
                        {folder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                {popularTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <Label className="text-xs text-muted-foreground">Popular:</Label>
                    {popularTags.slice(0, 5).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => {
                          if (!metadata.tags.includes(tag)) {
                            setMetadata(prev => ({
                              ...prev,
                              tags: [...prev.tags, tag],
                            }));
                          }
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {metadata.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Alt Text */}
              <div className="space-y-2">
                <Label>Alt Text (Optional)</Label>
                <Input
                  placeholder="Describe this media for accessibility"
                  value={metadata.altText}
                  onChange={(e) => setMetadata(prev => ({ ...prev, altText: e.target.value }))}
                />
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <Label>Caption (Optional)</Label>
                <Textarea
                  placeholder="Add a caption"
                  rows={3}
                  value={metadata.caption}
                  onChange={(e) => setMetadata(prev => ({ ...prev, caption: e.target.value }))}
                />
              </div>
            </div>

            {/* Upload Button */}
            <Button className="w-full" onClick={handleUpload}>
              <Upload className="mr-2 h-4 w-4" />
              Upload {selectedFiles.length} File(s)
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}