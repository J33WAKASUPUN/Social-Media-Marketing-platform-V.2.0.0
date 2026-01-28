import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PlatformBadge } from '@/components/PlatformBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Edit2, 
  Sparkles, 
  AlertCircle,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  Eye,
  Hash,
  Save,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLATFORM_CAPABILITIES, Platform } from '@/lib/platformCapabilities';

interface PlatformPreviewCardProps {
  platform: Platform;
  content: string;
  title?: string;
  hashtags: string[];
  mediaUrls: string[];
  mediaType: 'none' | 'image' | 'video';
  channelName: string;
  channelAvatar?: string;
  isOptimized: boolean;
  onContentChange?: (content: string) => void;
  onTitleChange?: (title: string) => void;
  editable?: boolean;
}

export function PlatformPreviewCard({
  platform,
  content,
  title,
  hashtags,
  mediaUrls,
  mediaType,
  channelName,
  channelAvatar,
  isOptimized,
  onContentChange,
  onTitleChange,
  editable = false,
}: PlatformPreviewCardProps) {
  const [showFullView, setShowFullView] = useState(false);
  // State for editing in dialog
  const [dialogEditMode, setDialogEditMode] = useState(false);
  const [dialogContent, setDialogContent] = useState(content);
  const [dialogTitle, setDialogTitle] = useState(title || '');

  // Sync content when props change
  useEffect(() => {
    setDialogContent(content);
  }, [content]);

  useEffect(() => {
    setDialogTitle(title || '');
  }, [title]);

  const platformConfig = PLATFORM_CAPABILITIES[platform];
  const charLimit = platformConfig.limits.maxTextLength;
  
  // Calculate char count INCLUDING hashtags
  const hashtagString = hashtags.length > 0 
    ? hashtags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ')
    : '';
  
  const fullContentWithHashtags = hashtags.length > 0 
    ? `${content}\n\n${hashtagString}`
    : content;
    
  const charCount = fullContentWithHashtags.length;
  const isOverLimit = charCount > charLimit;

  // Handle dialog edit save
  const handleDialogSave = () => {
    onContentChange?.(dialogContent);
    if (platform === 'youtube' && onTitleChange) {
      onTitleChange(dialogTitle);
    }
    setDialogEditMode(false);
  };

  // Handle dialog edit cancel
  const handleDialogCancel = () => {
    setDialogContent(content);
    setDialogTitle(title || '');
    setDialogEditMode(false);
  };

  // Open dialog in edit mode directly
  const handleEditClick = () => {
    setDialogEditMode(true);
    setShowFullView(true);
  };

  // Platform-specific styling
  const platformColors: Record<string, string> = {
    facebook: 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20',
    instagram: 'border-pink-500/30 bg-gradient-to-br from-pink-50/50 to-purple-50/50 dark:from-pink-950/20 dark:to-purple-950/20',
    linkedin: 'border-blue-600/30 bg-blue-50/50 dark:bg-blue-950/20',
    twitter: 'border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20',
    youtube: 'border-red-500/30 bg-red-50/50 dark:bg-red-950/20',
  };

  return (
    <>
      <Card className={cn(
        'relative overflow-hidden transition-all duration-200',
        platformColors[platform] || 'border-border'
      )}>
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PlatformBadge platform={platform} size="sm" />
              <div>
                <CardTitle className="text-sm font-medium">{channelName}</CardTitle>
                {isOptimized && (
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <Sparkles className="h-3 w-3" />
                    AI Optimized
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-1">
              {/* View Full Content Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowFullView(true)}
                title="View full content"
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              {/* ✅ CHANGED: Edit button now opens dialog directly */}
              {editable && onContentChange && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  className="h-8"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* YouTube Title */}
          {platform === 'youtube' && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Video Title
              </label>
              <p className="text-sm font-medium">
                {title || content.substring(0, 100)}
              </p>
            </div>
          )}

          {/* Content Preview - Read Only */}
          <div>
            {platform === 'youtube' && (
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Description
              </label>
            )}
            <p className="text-sm whitespace-pre-wrap line-clamp-4">
              {content}
            </p>
          </div>

          {/* Hashtags Section */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1 border-t border-dashed">
              {hashtags.slice(0, 5).map((tag, idx) => (
                <span key={idx} className="text-xs text-primary font-medium">
                  #{tag.replace(/^#/, '')}
                </span>
              ))}
              {hashtags.length > 5 && (
                <span className="text-xs text-muted-foreground">
                  +{hashtags.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Media Preview */}
          {mediaUrls.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {mediaUrls.slice(0, 3).map((url, idx) => (
                <div
                  key={idx}
                  className="relative h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0"
                >
                  {mediaType === 'video' ? (
                    <video
                      src={`${url}#t=0.1`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                  {mediaType === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Video className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {mediaUrls.length > 3 && (
                <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <span className="text-xs text-muted-foreground">
                    +{mediaUrls.length - 3}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Character Count */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              {mediaType !== 'none' && (
                <Badge variant="secondary" className="text-xs">
                  {mediaType === 'image' ? (
                    <><ImageIcon className="h-3 w-3 mr-1" />{mediaUrls.length} image{mediaUrls.length !== 1 ? 's' : ''}</>
                  ) : (
                    <><Video className="h-3 w-3 mr-1" />Video</>
                  )}
                </Badge>
              )}
              {hashtags.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />{hashtags.length}
                </Badge>
              )}
            </div>
            
            <div className={cn(
              "text-xs",
              isOverLimit ? "text-destructive" : "text-muted-foreground"
            )}>
              {isOverLimit && <AlertCircle className="h-3 w-3 inline mr-1" />}
              {charCount.toLocaleString()} / {charLimit.toLocaleString()}
            </div>
          </div>
        </CardContent>

        {/* Status Indicator */}
        {isOptimized && (
          <div className="absolute top-2 right-12">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
        )}
      </Card>

      {/* Full View / Edit Dialog */}
      <Dialog open={showFullView} onOpenChange={(open) => {
        setShowFullView(open);
        if (!open) {
          setDialogEditMode(false);
          setDialogContent(content);
          setDialogTitle(title || '');
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlatformBadge platform={platform} size="sm" />
              <span>{channelName}</span>
              {isOptimized && (
                <Badge variant="secondary" className="ml-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Optimized
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {dialogEditMode 
                ? `Edit your ${platform} post content`
                : `Preview of your ${platform} post as it will be published`
              }
            </DialogDescription>
          </DialogHeader>

          {/* ✅ UPDATED: Using custom-scrollbar class */}
          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
            <div className="space-y-4">
              {/* YouTube Title */}
              {platform === 'youtube' && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Video Title
                  </label>
                  {dialogEditMode ? (
                    <Input
                      value={dialogTitle}
                      onChange={(e) => setDialogTitle(e.target.value)}
                      maxLength={100}
                      placeholder="Enter video title..."
                      className="text-sm"
                    />
                  ) : (
                    <p className="text-base font-semibold p-3 bg-muted rounded-lg">
                      {title || content.substring(0, 100)}
                    </p>
                  )}
                </div>
              )}

              {/* Content Area */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {platform === 'youtube' ? 'Description' : 'Post Content'}
                  </label>
                  {/* ✅ Only show edit button when NOT in edit mode */}
                  {!dialogEditMode && onContentChange && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDialogEditMode(true)}
                      className="h-7"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                
                {dialogEditMode ? (
                  <Textarea
                    value={dialogContent}
                    onChange={(e) => setDialogContent(e.target.value)}
                    rows={10}
                    className="text-sm resize-none custom-scrollbar"
                    placeholder="Enter content..."
                  />
                ) : (
                  <div className="p-4 bg-muted rounded-lg max-h-[200px] overflow-y-auto custom-scrollbar">
                    <p className="text-sm whitespace-pre-wrap">
                      {content}
                    </p>
                  </div>
                )}
              </div>

              {/* Hashtags Section */}
              {hashtags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Hashtags ({hashtags.length})
                  </label>
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-primary">
                          #{tag.replace(/^#/, '')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Media Preview */}
              {mediaUrls.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {mediaType === 'video' ? 'Video' : `Images (${mediaUrls.length})`}
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {mediaUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-video rounded-lg overflow-hidden bg-muted"
                      >
                        {mediaType === 'video' ? (
                          <video
                            src={url}
                            controls
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <img
                            src={url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Preview (only when not editing) */}
              {!dialogEditMode && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    📝 Final Post (as it will be published)
                  </label>
                  <div className="p-4 bg-card border-2 border-primary/20 rounded-lg max-h-[200px] overflow-y-auto custom-scrollbar">
                    <p className="text-sm whitespace-pre-wrap">
                      {fullContentWithHashtags}
                    </p>
                  </div>
                  
                  {/* Character Count */}
                  <div className="flex items-center justify-end mt-2">
                    <span className={cn(
                      "text-xs",
                      isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"
                    )}>
                      {isOverLimit && <AlertCircle className="h-3 w-3 inline mr-1" />}
                      {charCount.toLocaleString()} / {charLimit.toLocaleString()} characters
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            {dialogEditMode ? (
              <div className="flex gap-2 w-full">
                <Button variant="outline" onClick={handleDialogCancel} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleDialogSave} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 w-full justify-end">
                {/* {onContentChange && (
                  <Button variant="outline" onClick={() => setDialogEditMode(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Content
                  </Button>
                )} */}
                <Button variant="secondary" onClick={() => setShowFullView(false)}>
                  Close
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}