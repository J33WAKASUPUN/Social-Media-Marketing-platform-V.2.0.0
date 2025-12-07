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
import { Upload, X, Image, Video, File, FolderOpen, Tag, MessageSquare, FileText } from 'lucide-react';
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
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !metadata.tags.includes(trimmedTag)) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
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

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image className="h-4 w-4 text-purple-600" />;
    }
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) {
      return <Video className="h-4 w-4 text-purple-600" />;
    }
    return <File className="h-4 w-4 text-purple-600" />;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Upload Media</DialogTitle>
          <DialogDescription>
            Upload images or videos to your media library
          </DialogDescription>
        </DialogHeader>

        {uploading ? (
          <div className="space-y-4 py-8">
            <div className="flex justify-center">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-4">
                <Upload className="h-8 w-8 text-purple-600 animate-pulse" />
              </div>
            </div>
            <p className="text-center text-sm font-medium">
              Uploading files...
            </p>
            <Progress value={uploadProgress} className="h-2 bg-gray-200 dark:bg-gray-800" />
            <p className="text-center text-lg font-semibold text-purple-600">
              {uploadProgress}%
            </p>
          </div>
        ) : !selectedFiles ? (
          <div
            className={cn(
              "rounded-lg border-2 border-dashed p-10 text-center transition-all duration-200",
              dragActive 
                ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20" 
                : "border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
              Drag and drop files here
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              or click to browse from your computer
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
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
            <p className="mt-4 text-xs text-gray-500">
              Max file size: 50MB • Supported: JPG, PNG, GIF, WebP, MP4, MOV
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected Files Preview */}
            <div className="rounded-lg border bg-gray-50 dark:bg-gray-900/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">
                  Selected Files ({selectedFiles.length})
                </p>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  Ready to upload
                </Badge>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded p-2 text-sm">
                    {getFileIcon(file.name)}
                    <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                onClick={() => setSelectedFiles(null)}
              >
                Change Files
              </Button>
            </div>

            {/* Metadata Form */}
            <div className="space-y-4">
              {/* Folder Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-gray-500" />
                  Folder
                </Label>
                <Select value={metadata.folder} onValueChange={(v) => setMetadata(prev => ({ ...prev, folder: v }))}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  Tags (Optional)
                </Label>
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
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleAddTag}
                  >
                    Add
                  </Button>
                </div>
                {popularTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-gray-500">Popular:</span>
                    {popularTags.slice(0, 5).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 dark:hover:bg-purple-900/20"
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
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:bg-white/20 rounded-full"
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
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Alt Text (Optional)
                </Label>
                <Input
                  placeholder="Describe this media for accessibility"
                  value={metadata.altText}
                  onChange={(e) => setMetadata(prev => ({ ...prev, altText: e.target.value }))}
                />
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  Caption (Optional)
                </Label>
                <Textarea
                  placeholder="Add a caption"
                  rows={3}
                  value={metadata.caption}
                  onChange={(e) => setMetadata(prev => ({ ...prev, caption: e.target.value }))}
                />
              </div>
            </div>

            {/* Upload Button */}
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleUpload}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload {selectedFiles.length} File(s)
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}