import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
  Hash,
  Image as ImageIcon,
  Video,
  ExternalLink,
  Edit2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
} from 'lucide-react';
import { PlatformBadge } from './PlatformBadge';
import { Post } from '@/services/postApi';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ViewPostDialogProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (postId: string) => void;
  onCancel?: (postId: string) => void;
  onRemoveFromHistory?: (postId: string) => void;
}

// Updated status config with dark mode support
const statusConfig = {
  scheduled: { 
    label: 'Scheduled', 
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', 
    icon: Clock 
  },
  published: { 
    label: 'Published', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 
    icon: CheckCircle 
  },
  draft: { 
    label: 'Draft', 
    color: 'bg-gray-100 text-gray-800 dark:bg-secondary dark:text-secondary-foreground', 
    icon: FileText 
  },
  failed: { 
    label: 'Failed', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', 
    icon: AlertTriangle 
  },
  publishing: { 
    label: 'Publishing', 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', 
    icon: Clock 
  },
};

const getPlatformPostUrl = (platform: string, platformPostId: string): string => {
  switch (platform.toLowerCase()) {
    case 'linkedin':
      return `https://www.linkedin.com/feed/update/${platformPostId}`;
    case 'facebook':
      return `https://www.facebook.com/${platformPostId.replace('_', '/posts/')}`;
    case 'twitter':
      return `https://twitter.com/i/status/${platformPostId}`;
    case 'instagram':
      // Fallback only if backend URL is missing
      return `https://www.instagram.com/p/${platformPostId}/`;
    case 'youtube':
      return `https://www.youtube.com/watch?v=${platformPostId}`;
    default:
      return '#';
  }
};

export function ViewPostDialog({
  post,
  open,
  onOpenChange,
  onEdit,
  onCancel,
  onRemoveFromHistory,
}: ViewPostDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!post) return null;

  const statusStyle = statusConfig[post.status] || statusConfig.draft;
  const StatusIcon = statusStyle.icon;
  const mediaUrls = post.mediaUrls || [];
  const hasMedia = mediaUrls.length > 0;
  const isVideo = post.mediaType === 'video';

  const publishedPlatforms = post.schedules
    ?.filter(s => s.status === 'published' && s.platformPostId)
    .map(s => ({
      platform: s.channel.provider,
      displayName: s.channel.displayName,
      // Use s.platformUrl if available
      postUrl: s.platformUrl || getPlatformPostUrl(s.channel.provider, s.platformPostId!),
      publishedAt: s.publishedAt,
    })) || [];

  const scheduledPlatforms = post.schedules
    ?.filter(s => s.status === 'pending' || s.status === 'queued')
    .map(s => ({
      platform: s.channel.provider,
      displayName: s.channel.displayName,
      scheduledFor: s.scheduledFor,
    })) || [];

  const failedPlatforms = post.schedules
    ?.filter(s => s.status === 'failed')
    .map(s => ({
      platform: s.channel.provider,
      displayName: s.channel.displayName,
      error: s.error || 'Publishing failed',
    })) || [];

  const nextImage = () => {
    if (mediaUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % mediaUrls.length);
    }
  };

  const prevImage = () => {
    if (mediaUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(post.content);
    toast.success('Content copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-background text-foreground">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-3">
                <Badge className={cn('flex items-center gap-1.5 border-0', statusStyle.color)}>
                  <StatusIcon className="h-4 w-4" />
                  {statusStyle.label}
                </Badge>
                {post.title && <span>{post.title}</span>}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{post.createdBy.name}</span>
                <span>•</span>
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(post.createdAt), 'MMM dd, yyyy HH:mm')}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Media Preview */}
            {hasMedia && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Media
                </h3>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted group border dark:border-border">
                  {isVideo ? (
                    <video
                      key={mediaUrls[currentImageIndex]}
                      src={mediaUrls[currentImageIndex]}
                      controls
                      controlsList="nodownload"
                      className="absolute inset-0 w-full h-full"
                      preload="metadata"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/800x450?text=Video+Not+Available';
                      }}
                    >
                      <source src={mediaUrls[currentImageIndex]} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={mediaUrls[currentImageIndex]}
                      alt={`Media ${currentImageIndex + 1}`}
                      className="absolute inset-0 w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/800x450?text=Image+Not+Available';
                      }}
                    />
                  )}

                  {/* Navigation Arrows */}
                  {mediaUrls.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 z-10"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}

                  {/* Image Counter Dots */}
                  {mediaUrls.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {mediaUrls.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            currentImageIndex === index
                              ? "bg-white w-6"
                              : "bg-white/50 hover:bg-white/75"
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {/* Counter Badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white text-sm font-medium flex items-center gap-2 z-10">
                    {isVideo ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                    {mediaUrls.length > 1 && `${currentImageIndex + 1}/${mediaUrls.length}`}
                  </div>
                </div>
              </div>
            )}

            {/* Post Content */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Content
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyContent}
                  className="h-8"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border dark:border-border">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{post.content}</p>
              </div>
            </div>

            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Hashtags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.hashtags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-border" />

            {/* Published Platforms */}
            {publishedPlatforms.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Published On
                </h3>
                <div className="grid gap-3">
                  {publishedPlatforms.map((platform, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg border bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    >
                      <div className="flex items-center gap-3">
                        <PlatformBadge platform={platform.platform as any} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{platform.displayName}</p>
                          {platform.publishedAt && (
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(platform.publishedAt), 'MMM dd, yyyy HH:mm')}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-background hover:bg-accent border-border"
                        onClick={() => window.open(platform.postUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Post
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scheduled Platforms */}
            {scheduledPlatforms.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Scheduled For
                </h3>
                <div className="grid gap-3">
                  {scheduledPlatforms.map((platform, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg border bg-amber-50/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                    >
                      <div className="flex items-center gap-3">
                        <PlatformBadge platform={platform.platform as any} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{platform.displayName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(platform.scheduledFor), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed Platforms */}
            {failedPlatforms.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Failed
                </h3>
                <div className="grid gap-3">
                  {failedPlatforms.map((platform, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg border bg-red-50/50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                    >
                      <div className="flex items-center gap-3">
                        <PlatformBadge platform={platform.platform as any} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{platform.displayName}</p>
                          <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {platform.error}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Post Metadata */}
            <Separator className="bg-border" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created By</p>
                <p className="font-medium text-foreground">{post.createdBy.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created At</p>
                <p className="font-medium text-foreground">
                  {format(new Date(post.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium text-foreground">
                  {format(new Date(post.updatedAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Media Type</p>
                <p className="font-medium capitalize text-foreground">{post.mediaType || 'None'}</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <div className="flex gap-2">
            {onEdit && (post.status === 'draft' || post.status === 'scheduled') && (
              <Button
                variant="default"
                onClick={() => {
                  onEdit(post._id);
                  onOpenChange(false);
                }}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Post
              </Button>
            )}

            {onCancel && post.status === 'scheduled' && (
              <Button
                variant="outline"
                className="bg-background hover:bg-accent"
                onClick={() => {
                  onCancel(post._id);
                  onOpenChange(false);
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Schedule
              </Button>
            )}

            {onRemoveFromHistory && (
              <Button
                variant="ghost"
                onClick={() => {
                  onRemoveFromHistory(post._id);
                  onOpenChange(false);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Remove from History
              </Button>
            )}
          </div>

          <Button variant="outline" className="bg-background hover:bg-accent" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}