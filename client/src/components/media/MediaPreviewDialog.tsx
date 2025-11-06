import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Download, Edit, Trash2, Play } from 'lucide-react';
import type { Media } from '@/types';

interface MediaPreviewDialogProps {
  media: Media | null;
  onClose: () => void;
  onEdit: (media: Media) => void;
  onDelete: (media: Media) => void;
  formatFileSize: (bytes: number) => string;
}

export function MediaPreviewDialog({
  media,
  onClose,
  onEdit,
  onDelete,
  formatFileSize,
}: MediaPreviewDialogProps) {
  if (!media) return null;

  return (
    <Dialog open={!!media} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{media.originalName}</DialogTitle>
          <DialogDescription>
            {formatFileSize(media.size)} • Uploaded {new Date(media.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ✅ PREVIEW */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            {media.type === 'image' ? (
              <img
                src={media.s3Url}
                alt={media.altText || media.filename}
                className="h-full w-full object-contain"
              />
            ) : media.type === 'video' ? (
              <video
                key={media.s3Url}
                src={media.s3Url}
                controls
                controlsList="nodownload"
                className="h-full w-full"
                preload="metadata"
              >
                <source src={media.s3Url} type={media.mimeType || 'video/mp4'} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <Play className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Unsupported media type
                </p>
              </div>
            )}
          </div>

          {/* ✅ DETAILS */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-muted-foreground">File Name</Label>
              <p className="text-sm">{media.filename}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Type</Label>
              <p className="text-sm capitalize">{media.type}</p>
            </div>
            {media.metadata?.width && media.metadata?.height && (
              <div>
                <Label className="text-muted-foreground">Dimensions</Label>
                <p className="text-sm">{media.metadata.width} × {media.metadata.height}</p>
              </div>
            )}
            {media.metadata?.duration && (
              <div>
                <Label className="text-muted-foreground">Duration</Label>
                <p className="text-sm">
                  {Math.floor(media.metadata.duration / 60)}:
                  {String(Math.floor(media.metadata.duration % 60)).padStart(2, '0')}
                </p>
              </div>
            )}
            <div>
              <Label className="text-muted-foreground">Usage</Label>
              <p className="text-sm">Used in {media.usageCount} post(s)</p>
            </div>
            {media.folder && (
              <div>
                <Label className="text-muted-foreground">Folder</Label>
                <p className="text-sm">{media.folder}</p>
              </div>
            )}
            {media.tags && media.tags.length > 0 && (
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">Tags</Label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {media.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {media.altText && (
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">Alt Text</Label>
                <p className="text-sm">{media.altText}</p>
              </div>
            )}
            {media.caption && (
              <div className="md:col-span-2">
                <Label className="text-muted-foreground">Caption</Label>
                <p className="text-sm">{media.caption}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => window.open(media.s3Url, '_blank')}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" onClick={() => onEdit(media)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </Button>
          <Button variant="destructive" onClick={() => onDelete(media)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}