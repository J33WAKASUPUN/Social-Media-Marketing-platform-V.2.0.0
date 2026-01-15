import { useState } from "react";
import { ViewPostDialog } from "./ViewPostDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  MoreVertical,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Edit2,
  XCircle,
  Archive,
  Info,
  Image as ImageIcon,
  Video,
  ChevronLeft,
  ChevronRight,
  Eye,
  Play,
} from "lucide-react";
import { PlatformBadge } from "@/components/PlatformBadge";
import { Post } from "@/services/postApi";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getPlatformCapability } from "@/lib/platformCapabilities";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sanitizeText, sanitizeHTML } from '@/lib/sanitize';

interface PostCardProps {
  post: Post;
  onRemoveFromHistory?: (id: string) => void;
  onEdit?: (id: string) => void;
  onCancel?: (id: string) => void;
  onPublish?: (id: string) => void;
}

const statusConfig = {
  scheduled: { label: "Scheduled", color: "bg-warning text-warning-foreground", icon: Clock },
  published: { label: "Published", color: "bg-success text-success-foreground", icon: CheckCircle },
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: Clock },
  failed: { label: "Failed", color: "bg-destructive text-destructive-foreground", icon: AlertTriangle },
  publishing: { label: "Publishing...", color: "bg-info text-info-foreground", icon: Clock },
};

const getPlatformPostUrl = (platform: string, platformPostId: string, username?: string): string => {
  switch (platform.toLowerCase()) {
    case 'linkedin':
      return `https://www.linkedin.com/feed/update/${platformPostId}`;
    case 'facebook':
      // Facebook IDs often have underscores (PageID_PostID) that need converting
      return `https://www.facebook.com/${platformPostId.replace('_', '/posts/')}`;
    case 'twitter':
    case 'x':
      if (username) {
        return `https://twitter.com/${username.replace('@', '')}/status/${platformPostId}`;
      }
      return `https://twitter.com/i/status/${platformPostId}`;
    case 'instagram':
      // This is the fallback only if backend url is missing
      return `https://www.instagram.com/p/${platformPostId}/`;
    case 'youtube':
      return `https://www.youtube.com/watch?v=${platformPostId}`;
    default:
      return '#';
  }
};

export const PostCard = ({ post, onRemoveFromHistory, onEdit, onCancel }: PostCardProps) => {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showLimitationsDialog, setShowLimitationsDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showViewDialog, setShowViewDialog] = useState(false);
  
  const statusStyle = statusConfig[post.status] || statusConfig.draft;
  const StatusIcon = statusStyle.icon;
  
  // Sanitize content before displaying
  const sanitizedContent = sanitizeText(post.content);
  const contentPreview = sanitizedContent.length > 100 
    ? sanitizedContent.slice(0, 100) + "..." 
    : sanitizedContent;

  const mediaUrls = post.mediaUrls || [];
  const isVideo = post.mediaType === 'video';
  
const platformsWithUrls = post.schedules?.map(s => ({
  platform: s.channel.provider,
  displayName: s.channel.displayName,
  platformPostId: s.platformPostId,
  platformUsername: s.channel.platformUsername,
  status: s.status,
  
  // 1. Try to use the URL provided by the backend first (Perfect for Instagram)
  // 2. If that doesn't exist, fall back to generating it manually (Perfect for others)
  postUrl: s.platformUrl || (s.platformPostId ? getPlatformPostUrl(s.channel.provider, s.platformPostId, s.channel.platformUsername) : null),
})) || [];

  const publishedPlatforms = platformsWithUrls.filter(p => p.status === 'published' && p.platformPostId);

  const platformLimitations = post.schedules?.map(s => ({
    platform: s.channel.provider,
    displayName: s.channel.displayName,
    warnings: getPlatformCapability(s.channel.provider).warnings,
    postUrl: s.platformPostId ? getPlatformPostUrl(s.channel.provider, s.platformPostId) : null,
  })) || [];

  const isDraft = post.status === 'draft';
  const isScheduled = post.status === 'scheduled';

  const scheduledDate = post.schedules?.[0]?.scheduledFor 
    ? format(new Date(post.schedules[0].scheduledFor), 'MMM dd, yyyy HH:mm')
    : null;

  const handleRemoveFromHistory = () => {
    if (onRemoveFromHistory) {
      onRemoveFromHistory(post._id);
      setShowRemoveDialog(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(post._id);
      setShowCancelDialog(false);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaUrls.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % mediaUrls.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaUrls.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
    }
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const hasEditableActions = !!(onEdit || onCancel || onRemoveFromHistory);
  const hasAnyActions = hasEditableActions || publishedPlatforms.length > 0 || platformsWithUrls.length > 0;

  return (
    <>
      <Card className="group flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20">
        {/* Media Preview with Slider */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {mediaUrls.length > 0 ? (
            <>
              {/* ✅ RENDER VIDEO OR IMAGE */}
              {isVideo ? (
                <div className="relative h-full w-full bg-black">
                  <video
                    src={`${mediaUrls[currentImageIndex]}#t=0.1`}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Play icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity group-hover:bg-black/40">
                    <div className="rounded-full bg-white/90 p-4 transition-transform group-hover:scale-110">
                      <Play className="h-8 w-8 text-black" fill="black" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={mediaUrls[currentImageIndex]}
                  alt={`Post media ${currentImageIndex + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                  }}
                />
              )}
              
              {/* Navigation Arrows - only for multiple media */}
              {mediaUrls.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 z-10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Dot Indicators - only for multiple media */}
              {mediaUrls.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {mediaUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => goToImage(index, e)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-200",
                        currentImageIndex === index
                          ? "bg-white w-4"
                          : "bg-white/50 hover:bg-white/80"
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Media Counter Badge */}
              {mediaUrls.length > 0 && (
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 text-white text-xs font-medium flex items-center gap-1 z-10">
                  {isVideo ? (
                    <Video className="h-3 w-3" />
                  ) : (
                    <ImageIcon className="h-3 w-3" />
                  )}
                  {mediaUrls.length > 1 && `${currentImageIndex + 1}/${mediaUrls.length}`}
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground/50">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No media</p>
              </div>
            </div>
          )}
          
          {/* Status badge overlay */}
          <div className="absolute top-3 left-3 z-10">
            <Badge className={cn("flex items-center gap-1.5 shadow-lg", statusStyle.color)}>
              <StatusIcon className="h-3.5 w-3.5" />
              {statusStyle.label}
            </Badge>
          </div>
        </div>

        {/* Card Content */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Platform badges and menu */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-wrap gap-1.5">
              {platformsWithUrls.slice(0, 3).map((p, i) => (
                <PlatformBadge key={i} platform={p.platform as any} size="sm" />
              ))}
              {platformsWithUrls.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{platformsWithUrls.length - 3}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowViewDialog(true)}
                title="View details"
              >
                <Eye className="h-4 w-4" />
              </Button>

              {hasAnyActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-1">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {publishedPlatforms.length > 0 && (
                      <>
                        {publishedPlatforms.map((platform, i) => (
                          <DropdownMenuItem
                            key={i}
                            onClick={() => window.open(platform.postUrl!, '_blank')}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open on {platform.displayName}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {isDraft && onEdit && (
                      <>
                        <DropdownMenuItem onClick={() => onEdit(post._id)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Draft or Publish Now
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    {isScheduled && (
                      <>
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(post._id)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit Scheduled Post
                          </DropdownMenuItem>
                        )}
                        {onCancel && (
                          <DropdownMenuItem onClick={() => setShowCancelDialog(true)} className="text-amber-600">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Schedule
                          </DropdownMenuItem>
                        )}
                        {(onEdit || onCancel) && <DropdownMenuSeparator />}
                      </>
                    )}

                    {platformsWithUrls.length > 0 && (
                      <>
                        <DropdownMenuItem onClick={() => setShowLimitationsDialog(true)}>
                          <Info className="mr-2 h-4 w-4" />
                          Platform Info
                        </DropdownMenuItem>
                        {onRemoveFromHistory && <DropdownMenuSeparator />}
                      </>
                    )}

                    {onRemoveFromHistory && (
                      <DropdownMenuItem
                        className="text-muted-foreground"
                        onClick={() => setShowRemoveDialog(true)}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Remove from History
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0">
            {isDraft && !contentPreview ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-4">
                <Edit2 className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {onEdit ? "Edit this draft to publish or schedule" : "Draft post"}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-foreground/80 line-clamp-3">
                  {contentPreview}
                </p>
                
                {/* Hashtags Preview */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {post.hashtags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs text-primary/70">
                        {tag}
                      </span>
                    ))}
                    {post.hashtags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{post.hashtags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer: Date/Time */}
          <div className="pt-3 border-t">
            {scheduledDate && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{scheduledDate}</span>
              </div>
            )}
            
            {post.status === 'published' && post.schedules?.[0]?.publishedAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                <span>{format(new Date(post.schedules[0].publishedAt), 'MMM dd, yyyy HH:mm')}</span>
              </div>
            )}
            
            {isDraft && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Created {format(new Date(post.createdAt || Date.now()), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <ViewPostDialog
        post={post}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        onEdit={onEdit}
        onCancel={onCancel}
        onRemoveFromHistory={onRemoveFromHistory}
      />

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-amber-500" />
              Cancel Scheduled Post?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this scheduled post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Schedule</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-amber-500 hover:bg-amber-600">
              Cancel Schedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-amber-500" />
              Remove Post from History?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This action <strong>ONLY removes the post from your local history log</strong>. 
                It does <strong>not</strong> delete the post on the social platform(s).
              </p>
              
              {publishedPlatforms.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This post is live on: {publishedPlatforms.map(p => p.displayName).join(', ')}
                  </AlertDescription>
                </Alert>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveFromHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove from History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showLimitationsDialog} onOpenChange={setShowLimitationsDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Platform Information</DialogTitle>
            <DialogDescription>
              Details about this post on each platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {platformLimitations.map((p, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <PlatformBadge platform={p.platform as any} size="md" />
                  {p.postUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(p.postUrl!, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  )}
                </div>
                {p.warnings.length > 0 && (
                  <div className="text-sm space-y-1">
                    {p.warnings.map((w, j) => (
                      <p key={j} className="text-muted-foreground">{w}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};