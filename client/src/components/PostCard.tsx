import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "@/components/PlatformBadge";
import { MoreVertical, ExternalLink, Archive, Calendar, CheckCircle, Clock, AlertTriangle, Info, Edit2, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Post } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getPlatformCapability } from "@/lib/platformCapabilities";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PostCardProps {
  post: Post;
  onRemoveFromHistory?: (id: string) => void;
  onEdit?: (id: string) => void; // ✅ For scheduled posts
  onCancel?: (id: string) => void; // ✅ For scheduled posts
}

const statusConfig = {
  scheduled: { label: "Scheduled", color: "bg-warning text-warning-foreground", icon: Clock },
  published: { label: "Published", color: "bg-success text-success-foreground", icon: CheckCircle },
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: Clock },
  failed: { label: "Failed", color: "bg-destructive text-destructive-foreground", icon: AlertTriangle },
  publishing: { label: "Publishing...", color: "bg-info text-info-foreground", icon: Clock },
};

// ✅ HELPER FUNCTION: Generate platform-specific post URL
const getPlatformPostUrl = (platform: string, platformPostId: string, username?: string): string => {
  switch (platform.toLowerCase()) {
    case 'linkedin':
      return `https://www.linkedin.com/feed/update/${platformPostId}`;
    
    case 'facebook':
      return `https://www.facebook.com/${platformPostId.replace('_', '/posts/')}`;
    
    case 'twitter':
      if (username) {
        return `https://twitter.com/${username.replace('@', '')}/status/${platformPostId}`;
      }
      return `https://twitter.com/i/status/${platformPostId}`;
    
    case 'instagram':
      return `https://www.instagram.com/p/${platformPostId}/`;
    
    case 'youtube':
      return `https://www.youtube.com/watch?v=${platformPostId}`;
    
    default:
      return '#';
  }
};

export const PostCard = ({ post, onRemoveFromHistory, onEdit, onCancel }: PostCardProps) => {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showLimitationsDialog, setShowLimitationsDialog] = useState(false);
  
  const statusStyle = statusConfig[post.status] || statusConfig.draft;
  const StatusIcon = statusStyle.icon;
  const contentPreview = post.content.length > 120 ? post.content.slice(0, 120) + "..." : post.content;

  // Get media URLs
  const mediaUrls = post.mediaUrls || [];
  
  // Get scheduled platforms with their post URLs
  const platformsWithUrls = post.schedules?.map(s => ({
    platform: s.channel.provider,
    displayName: s.channel.displayName,
    platformPostId: s.platformPostId,
    platformUsername: s.channel.platformUsername,
    status: s.status,
    postUrl: s.platformPostId ? getPlatformPostUrl(s.channel.provider, s.platformPostId, s.channel.platformUsername) : null,
  })) || [];
  
  // Get next schedule date
  const nextSchedule = post.schedules?.find(s => s.status === 'pending' || s.status === 'queued');
  const scheduledDate = nextSchedule ? format(new Date(nextSchedule.scheduledFor), 'MMM dd, yyyy HH:mm') : null;

  // Get published platforms (for "View on..." button)
  const publishedPlatforms = platformsWithUrls.filter(p => p.status === 'published' && p.postUrl);

  // ✅ Check if post is scheduled (not yet published)
  const isScheduled = post.status === 'scheduled' && !publishedPlatforms.length;

  // Check if post has platform limitations (always true now)
  const platformLimitations = platformsWithUrls.map(p => {
    const cap = getPlatformCapability(p.platform as any);
    return {
      platform: p.platform,
      displayName: cap.displayName,
      warnings: cap.warnings,
      postUrl: p.postUrl,
      status: p.status,
    };
  });

  const handleRemoveFromHistory = () => {
    onRemoveFromHistory?.(post._id);
    setShowRemoveDialog(false);
  };

  return (
    <>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Media Preview */}
        {mediaUrls.length > 0 && (
          <div className="relative aspect-video overflow-hidden bg-muted">
            <img
              src={mediaUrls[0]}
              alt="Post media"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x450?text=Media+Not+Found';
              }}
            />
            {mediaUrls.length > 1 && (
              <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                +{mediaUrls.length - 1} more
              </div>
            )}
          </div>
        )}
        
        <div className="p-4 space-y-3">
          {/* Header: Status and Actions */}
          <div className="flex items-start justify-between gap-2">
            <Badge className={cn("flex items-center gap-1", statusStyle.color)}>
              <StatusIcon className="h-3 w-3" />
              {statusStyle.label}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* ✅ FOR PUBLISHED POSTS: Open on Platform */}
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

                {/* ✅ FOR SCHEDULED POSTS: Edit/Cancel */}
                {isScheduled && (
                  <>
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(post._id)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Scheduled Post
                      </DropdownMenuItem>
                    )}
                    {onCancel && (
                      <DropdownMenuItem onClick={() => onCancel(post._id)} className="text-amber-600">
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Schedule
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Platform Info */}
                <DropdownMenuItem onClick={() => setShowLimitationsDialog(true)}>
                  <Info className="mr-2 h-4 w-4" />
                  Platform Info
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* ✅ REMOVE FROM HISTORY */}
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
          </div>

          {/* Content */}
          <p className="text-sm leading-relaxed text-foreground/90 line-clamp-3">
            {contentPreview}
          </p>

          {/* Platforms */}
          <div className="flex flex-wrap gap-1.5">
            {platformsWithUrls.map((platform, index) => (
              <PlatformBadge key={index} platform={platform.platform as any} size="sm" />
            ))}
          </div>

          {/* Footer: Date/Time */}
          {scheduledDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
              <Calendar className="h-3 w-3" />
              <span>Scheduled for {scheduledDate}</span>
            </div>
          )}
          
          {post.status === 'published' && post.schedules?.[0]?.publishedAt && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
              <CheckCircle className="h-3 w-3" />
              <span>Published {format(new Date(post.schedules[0].publishedAt), 'MMM dd, yyyy HH:mm')}</span>
            </div>
          )}
        </div>
      </Card>

      {/* ✅ REMOVE FROM HISTORY DIALOG (FIXED RED BUTTON) */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from History?</AlertDialogTitle>
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
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            {/* Secondary Action: Go to Platform */}
            {publishedPlatforms.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  publishedPlatforms.forEach(p => window.open(p.postUrl!, '_blank'));
                  setShowRemoveDialog(false);
                }}
                className="w-full sm:w-auto"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Go to {publishedPlatforms[0].displayName}
                {publishedPlatforms.length > 1 && ` (+${publishedPlatforms.length - 1})`}
              </Button>
            )}

            {/* ✅ PRIMARY ACTION: Remove from History (RED BUTTON, INSIDE DIALOG) */}
            <AlertDialogAction
              onClick={handleRemoveFromHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              I Understand, Remove from History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ PLATFORM INFORMATION DIALOG (SAME FOR ALL PLATFORMS) */}
      <Dialog open={showLimitationsDialog} onOpenChange={setShowLimitationsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Platform Information
            </DialogTitle>
            <DialogDescription>
              How to manage this post on each platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {platformLimitations.map((limit, index) => (
              <Alert key={index}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <PlatformBadge platform={limit.platform as any} size="sm" />
                    {limit.status === 'published' && (
                      <Badge variant="outline" className="text-xs">Published</Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <div>
                        <strong>Edit Post:</strong> Not supported - must edit on platform
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <div>
                        <strong>Delete Post:</strong> Not supported - must delete on platform
                      </div>
                    </div>
                  </div>

                  {/* Platform-specific warnings */}
                  {limit.warnings.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                      <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                        {limit.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ✅ Link to platform */}
                  {limit.postUrl && limit.status === 'published' && (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(limit.postUrl!, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open on {limit.displayName}
                    </Button>
                  )}
                </div>
              </Alert>
            ))}
          </div>

          <Alert className="mt-4">
            <AlertTitle>💡 How to Manage Posts</AlertTitle>
            <AlertDescription className="text-xs space-y-2">
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Open on [Platform]" to manage the post directly on the social network</li>
                <li>Edit or delete the post on that platform using their native tools</li>
                <li>Return here and click "Remove from History" to clean up your log</li>
              </ol>
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    </>
  );
};