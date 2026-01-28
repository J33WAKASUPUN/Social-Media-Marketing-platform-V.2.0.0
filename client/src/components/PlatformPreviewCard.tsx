import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PlatformBadge } from '@/components/PlatformBadge';
import { 
  Edit2, 
  Check, 
  X, 
  Sparkles, 
  AlertCircle,
  Image as ImageIcon,
  Video,
  CheckCircle2,
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [editedTitle, setEditedTitle] = useState(title || '');

  const platformConfig = PLATFORM_CAPABILITIES[platform];
  const charLimit = platform === 'youtube' 
    ? platformConfig.limits.maxTextLength 
    : platformConfig.limits.maxTextLength;
  
  const isOverLimit = content.length > charLimit;
  const charCount = content.length;

  const handleSave = () => {
    onContentChange?.(editedContent);
    if (platform === 'youtube' && onTitleChange) {
      onTitleChange(editedTitle);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setEditedTitle(title || '');
    setIsEditing(false);
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
    <Card className={cn(
      'relative overflow-hidden transition-all duration-200',
      platformColors[platform] || 'border-border',
      isEditing && 'ring-2 ring-primary'
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
          
          {editable && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          
          {isEditing && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
              <Button variant="default" size="icon" className="h-8 w-8" onClick={handleSave}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* YouTube Title */}
        {platform === 'youtube' && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Video Title
            </label>
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                maxLength={100}
                placeholder="Enter video title..."
                className="text-sm"
              />
            ) : (
              <p className="text-sm font-medium">
                {title || content.substring(0, 100)}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div>
          {platform === 'youtube' && (
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Description
            </label>
          )}
          
          {isEditing ? (
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={4}
              className="text-sm resize-none"
              placeholder="Enter content..."
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap line-clamp-4">
              {content}
            </p>
          )}
        </div>

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hashtags.slice(0, 5).map((tag, idx) => (
              <span key={idx} className="text-xs text-primary">
                #{tag}
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
          <div className="flex gap-2 overflow-x-auto pb-2">
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
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
      )}
    </Card>
  );
}