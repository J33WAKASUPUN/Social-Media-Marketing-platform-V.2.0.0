import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Download, Trash2, MoreVertical, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Media } from '@/types';

interface MediaCardProps {
  media: Media;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onToggleSelect: () => void;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  formatFileSize: (bytes: number) => string;
}

export function MediaCard({
  media,
  viewMode,
  isSelected,
  onToggleSelect,
  onPreview,
  onEdit,
  onDelete,
  formatFileSize,
}: MediaCardProps) {
  if (viewMode === 'grid') {
    return (
      <Card
        className={cn(
          "group overflow-hidden transition-all duration-300 hover:shadow-xl",
          isSelected && "ring-2 ring-primary"
        )}
      >
        <div>
          <div
            className="relative aspect-video cursor-pointer overflow-hidden bg-muted"
            onClick={onPreview}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelect}
              className="absolute left-2 top-2 z-10"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* ✅ RENDER MEDIA */}
            {media.type === 'image' ? (
              <img
                src={media.s3Url}
                alt={media.altText || media.filename}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : media.type === 'video' ? (
              <div className="relative h-full w-full bg-black">
                {/* ✅ Video element with first frame */}
                <video
                  src={`${media.s3Url}#t=0.1`}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                {/* ✅ Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="rounded-full bg-white/90 p-3 transition-transform group-hover:scale-110">
                    <Play className="h-8 w-8 text-black" fill="black" />
                  </div>
                </div>
                {/* ✅ Duration badge (if available) */}
                {media.metadata?.duration && (
                  <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                    {Math.floor(media.metadata.duration / 60)}:{String(Math.floor(media.metadata.duration % 60)).padStart(2, '0')}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <p className="text-sm text-muted-foreground">Unsupported format</p>
              </div>
            )}

            <div className="absolute bottom-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(media.s3Url, '_blank'); }}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="p-3">
            <p className="truncate text-sm font-medium">{media.originalName}</p>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatFileSize(media.size)}
              </span>
              <Badge variant="outline" className="text-xs">
                Used {media.usageCount}x
              </Badge>
            </div>
            {media.tags && media.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {media.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {media.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{media.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // ✅ LIST VIEW
  return (
    <Card className={cn("transition-all", isSelected && "ring-2 ring-primary")}>
      <div className="flex items-center gap-4 p-4">
        <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} />
        <div
          className="relative h-16 w-16 cursor-pointer overflow-hidden rounded bg-muted"
          onClick={onPreview}
        >
          {media.type === 'image' ? (
            <img
              src={media.s3Url}
              alt={media.altText || media.filename}
              className="h-full w-full object-cover"
            />
          ) : media.type === 'video' ? (
            <div className="relative h-full w-full bg-black">
              <video
                src={`${media.s3Url}#t=0.1`}
                className="h-full w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="h-4 w-4 text-white" fill="white" />
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <p className="text-xs text-muted-foreground">?</p>
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium">{media.originalName}</p>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(media.size)} • {media.metadata?.width && media.metadata?.height
              ? `${media.metadata.width}×${media.metadata.height}`
              : media.type}
            {media.metadata?.duration && (
              <> • {Math.floor(media.metadata.duration / 60)}:{String(Math.floor(media.metadata.duration % 60)).padStart(2, '0')}</>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {new Date(media.createdAt).toLocaleDateString()}
          </p>
          <Badge variant="outline" className="mt-1 text-xs">
            Used {media.usageCount}x
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
}