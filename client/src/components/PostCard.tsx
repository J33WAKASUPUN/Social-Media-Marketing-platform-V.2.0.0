import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "@/components/PlatformBadge";
import { MoreVertical, ExternalLink, Archive, Calendar, CheckCircle, Clock, AlertTriangle, Info, Edit2, XCircle, Send, FileText } from "lucide-react";
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

export const PostCard = ({ post, onRemoveFromHistory, onEdit, onCancel, onPublish }: PostCardProps) => {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showLimitationsDialog, setShowLimitationsDialog] = useState(false);
  
  const statusStyle = statusConfig[post.status] || statusConfig.draft;
  const StatusIcon = statusStyle.icon;
  const contentPreview = post.content.length > 100 ? post.content.slice(0, 100) + "..." : post.content;

  const mediaUrls = post.mediaUrls || [];
  
  const platformsWithUrls = post.schedules?.map(s => ({
    platform: s.channel.provider,
    displayName: s.channel.displayName,
    platformPostId: s.platformPostId,
    platformUsername: s.channel.platformUsername,
    status: s.status,
    postUrl: s.platformPostId ? getPlatformPostUrl(s.channel.provider, s.platformPostId, s.channel.platformUsername) : null,
  })) || [];
  
  const nextSchedule = post.schedules?.find(s => s.status === 'pending' || s.status === 'queued');
  const scheduledDate = nextSchedule ? format(new Date(nextSchedule.scheduledFor), 'MMM dd, yyyy HH:mm') : null;

  const publishedPlatforms = platformsWithUrls.filter(p => p.status === 'published' && p.postUrl);

  const isScheduled = post.status === 'scheduled' && !publishedPlatforms.length;
  const isDraft = post.status === 'draft';

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

  const handleCancelSchedule = () => {
    onCancel?.(post._id);
    setShowCancelDialog(false);
  };

  return (
    <>
      <Card className="group flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20">
        {/* Media Preview - Fixed Height */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {mediaUrls.length > 0 ? (
            <>
              <img
                src={mediaUrls[0]}
                alt="Post media"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/800x450?text=Media+Not+Found';
                }}
              />
              {mediaUrls.length > 1 && (
                <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                  +{mediaUrls.length - 1} more
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          
          {/* Status Badge - Overlay */}
          <div className="absolute top-3 left-3">
            <Badge className={cn("flex items-center gap-1.5 px-3 py-1 shadow-lg", statusStyle.color)}>
              <StatusIcon className="h-3.5 w-3.5" />
              {statusStyle.label}
            </Badge>
          </div>
        </div>
        
        {/* Content Area - Fixed Height with Flex */}
        <div className="flex flex-col flex-1 p-5 space-y-4">
          {/* Header: Actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5 flex-1">
              {platformsWithUrls.length > 0 ? (
                platformsWithUrls.map((platform, index) => (
                  <PlatformBadge key={index} platform={platform.platform as any} size="sm" />
                ))
              ) : (
                isDraft && (
                  <span className="text-xs text-muted-foreground italic">No platform selected</span>
                )
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
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

                {isDraft && (
                  <>
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(post._id)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Draft
                      </DropdownMenuItem>
                    )}
                    {onPublish && (
                      <DropdownMenuItem onClick={() => onPublish(post._id)} className="text-green-600">
                        <Send className="mr-2 h-4 w-4" />
                        Publish Now
                      </DropdownMenuItem>
                    )}
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
                    <DropdownMenuSeparator />
                  </>
                )}

                {platformsWithUrls.length > 0 && (
                  <>
                    <DropdownMenuItem onClick={() => setShowLimitationsDialog(true)}>
                      <Info className="mr-2 h-4 w-4" />
                      Platform Info
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
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
          </div>

          {/* Content - Fixed Height with line clamp */}
          <div className="flex-1 min-h-0">
            {isDraft && !contentPreview ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-4">
                <Edit2 className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Edit, publish, or schedule this post
                </p>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-foreground/80 line-clamp-3">
                {contentPreview}
              </p>
            )}
          </div>

          {/* Footer: Date/Time - Fixed at bottom */}
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

      {/* ✅ CANCEL SCHEDULE DIALOG */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-amber-500" />
              Cancel Scheduled Post?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the scheduled post and move it to drafts. You can reschedule it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {scheduledDate && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                <strong>Scheduled for:</strong> {scheduledDate}
              </AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter className="sm:space-x-2">
            <AlertDialogCancel>Keep Schedule</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSchedule}
              className="bg-amber-500 text-white hover:bg-amber-600"
            >
              Cancel Schedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ REMOVE FROM HISTORY DIALOG - FIXED */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent className="sm:max-w-lg">
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
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="mt-0 sm:mt-0">Cancel</AlertDialogCancel>

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

            <AlertDialogAction
              onClick={handleRemoveFromHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              Remove from History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ PLATFORM INFORMATION DIALOG */}
      <Dialog open={showLimitationsDialog} onOpenChange={setShowLimitationsDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
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
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <strong>Edit Post:</strong> Not supported - must edit on platform
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <strong>Delete Post:</strong> Not supported - must delete on platform
                      </div>
                    </div>
                  </div>

                  {limit.warnings.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                      <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                        {limit.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

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