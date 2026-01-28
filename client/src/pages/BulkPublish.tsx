import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentTypeSelector } from '@/components/bulk-publish/ContentTypeSelector';
import { ChannelAssignment } from '@/components/bulk-publish/ChannelAssignment';
import { PlatformPreviewCard } from '@/components/bulk-publish/PlatformPreviewCard';
import { BulkPublishProgressDialog } from '@/components/bulk-publish/BulkPublishProgressDialog';
import { MediaLibrarySelector } from '@/components/media/MediaLibrarySelector';
import { useBrand } from '@/contexts/BrandContext';
import { 
  bulkPublishApi, 
  ContentType, 
  ContentTypeInfo, 
  AvailableChannelsResponse,
  ChannelAssignment as ChannelAssignmentType,
  BulkPost,
  PlatformContent,
} from '@/services/bulkPublishApi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Send, 
  Clock, 
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Video,
  X,
  Plus,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Layers,
  FileText,
  Hash,
} from 'lucide-react';
import type { Platform } from '@/lib/platformCapabilities';
import type { Media } from '@/types';

export default function BulkPublish() {
  const navigate = useNavigate();
  const { currentBrand } = useBrand();

  // Content Types
  const [contentTypes, setContentTypes] = useState<ContentTypeInfo[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null);
  
  // Channels
  const [availableChannels, setAvailableChannels] = useState<AvailableChannelsResponse | null>(null);
  const [channelAssignments, setChannelAssignments] = useState<ChannelAssignmentType[]>([]);
  
  // Content
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [optimizedContent, setOptimizedContent] = useState<Record<string, PlatformContent>>({});
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  
  // Media
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  
  // Publishing
  const [publishType, setPublishType] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Progress Dialog
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [currentBulkPost, setCurrentBulkPost] = useState<BulkPost | null>(null);
  
  // Loading States
  const [loadingContentTypes, setLoadingContentTypes] = useState(true);
  const [loadingChannels, setLoadingChannels] = useState(false);

  // Load content types on mount
  useEffect(() => {
    loadContentTypes();
  }, []);

  // Load channels when content type changes
  useEffect(() => {
    if (selectedContentType && currentBrand) {
      loadAvailableChannels();
    }
  }, [selectedContentType, currentBrand]);

  // Reset optimized content when original content changes
  useEffect(() => {
    setIsOptimized(false);
    setOptimizedContent({});
  }, [content]);

  const loadContentTypes = async () => {
    try {
      setLoadingContentTypes(true);
      const response = await bulkPublishApi.getContentTypes();
      setContentTypes(response.data);
    } catch (error: any) {
      toast.error('Failed to load content types');
    } finally {
      setLoadingContentTypes(false);
    }
  };

  const loadAvailableChannels = async () => {
    if (!currentBrand || !selectedContentType) return;
    
    try {
      setLoadingChannels(true);
      const response = await bulkPublishApi.getAvailableChannels(
        currentBrand._id,
        selectedContentType
      );
      setAvailableChannels(response.data);
      
      // Auto-assign first channel for each platform
      const autoAssignments: ChannelAssignmentType[] = [];
      for (const platform of response.data.targetPlatforms) {
        const platformChannels = response.data.channels[platform];
        if (platformChannels && platformChannels.length > 0) {
          autoAssignments.push({
            platform,
            channel: platformChannels[0]._id,
          });
        }
      }
      setChannelAssignments(autoAssignments);
    } catch (error: any) {
      toast.error('Failed to load channels');
    } finally {
      setLoadingChannels(false);
    }
  };

  const handleContentTypeSelect = (type: ContentType) => {
    setSelectedContentType(type);
    setChannelAssignments([]);
    setSelectedMedia([]);
    setIsOptimized(false);
    setOptimizedContent({});
  };

  const handleChannelAssignmentChange = (platform: string, channelId: string) => {
    setChannelAssignments(prev => {
      const existing = prev.findIndex(a => a.platform === platform);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { platform, channel: channelId };
        return updated;
      }
      return [...prev, { platform, channel: channelId }];
    });
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && hashtagInput.trim()) {
      e.preventDefault();
      const newTag = hashtagInput.trim().replace(/^#/, '');
      if (!hashtags.includes(newTag)) {
        setHashtags([...hashtags, newTag]);
      }
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handleOptimizeContent = async () => {
    if (!content.trim() || !selectedContentType) {
      toast.error('Please enter content first');
      return;
    }

    try {
      setIsOptimizing(true);
      const response = await bulkPublishApi.optimizeContent(
        content,
        selectedContentType,
        hashtags
      );
      
      setOptimizedContent(response.data.platformContent);
      setIsOptimized(true);
      toast.success('Content optimized for all platforms!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to optimize content');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handlePublish = async () => {
    // Validation
    if (!currentBrand) {
      toast.error('Please select a brand');
      return;
    }

    if (!selectedContentType) {
      toast.error('Please select a content type');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter content');
      return;
    }

    if (channelAssignments.length === 0) {
      toast.error('Please assign at least one channel');
      return;
    }

    // Check if all required platforms have assignments
    const requiredPlatforms = availableChannels?.targetPlatforms || [];
    const assignedPlatforms = channelAssignments.map(a => a.platform);
    const missingPlatforms = requiredPlatforms.filter(p => !assignedPlatforms.includes(p));
    
    if (missingPlatforms.length > 0) {
      toast.error(`Please assign channels for: ${missingPlatforms.join(', ')}`);
      return;
    }

    if (publishType === 'scheduled' && !scheduledDate) {
      toast.error('Please select a scheduled date and time');
      return;
    }

    if (publishType === 'scheduled' && new Date(scheduledDate) <= new Date()) {
      toast.error('Scheduled time must be in the future');
      return;
    }

    // Media validation
    const contentTypeInfo = contentTypes.find(t => t.id === selectedContentType);
    if (contentTypeInfo?.supportsImages && selectedContentType === 'text-image' && selectedMedia.length === 0) {
      toast.error('Please select at least one image');
      return;
    }
    if (contentTypeInfo?.supportsVideos && selectedContentType === 'text-video' && selectedMedia.length === 0) {
      toast.error('Please select a video');
      return;
    }

    try {
      setIsPublishing(true);
      setShowProgressDialog(true);

      const response = await bulkPublishApi.create({
        brandId: currentBrand._id,
        contentType: selectedContentType,
        content,
        hashtags,
        mediaLibraryIds: selectedMedia,
        channelAssignments,
        publishType,
        scheduledFor: publishType === 'scheduled' ? scheduledDate : undefined,
        settings: {
          notifyOnComplete: true,
          retryOnFail: true,
        },
      });

      setCurrentBulkPost(response.data);
      
      if (publishType === 'scheduled') {
        toast.success('Bulk post scheduled successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create bulk post');
      setShowProgressDialog(false);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleProgressDialogClose = () => {
    setShowProgressDialog(false);
    
    if (currentBulkPost?.status === 'completed' || currentBulkPost?.status === 'partial') {
      navigate('/posts');
    }
  };

  // Get media URLs for preview
  const mediaUrls = useMemo(() => {
    return mediaItems
      .filter(m => selectedMedia.includes(m._id))
      .map(m => m.s3Url);
  }, [mediaItems, selectedMedia]);

  const mediaType = useMemo(() => {
    if (selectedContentType === 'text-video') return 'video';
    if (selectedContentType === 'text-image') return 'image';
    return 'none';
  }, [selectedContentType]);

  // Check if ready to publish
  const canPublish = useMemo(() => {
    if (!selectedContentType || !content.trim()) return false;
    if (channelAssignments.length === 0) return false;
    if (selectedContentType === 'text-image' && selectedMedia.length === 0) return false;
    if (selectedContentType === 'text-video' && selectedMedia.length === 0) return false;
    if (publishType === 'scheduled' && !scheduledDate) return false;
    return true;
  }, [selectedContentType, content, channelAssignments, selectedMedia, publishType, scheduledDate]);

  if (!currentBrand) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Brand Selected</AlertTitle>
          <AlertDescription>
            Please select a brand from the sidebar to create bulk posts.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-background p-4 md:p-6">
      <PageHeader
        title="Bulk Publish"
        description="Create and publish content to multiple platforms at once"
        actions={
          <Button variant="outline" onClick={() => navigate('/posts')}>
            <FileText className="h-4 w-4 mr-2" />
            View Posts
          </Button>
        }
      />

      <div className="mt-6 space-y-6">
        {/* Step 1: Content Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              Select Content Type
            </CardTitle>
            <CardDescription>
              Choose what type of content you want to publish. This determines which platforms will receive your post.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingContentTypes ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : (
              <ContentTypeSelector
                contentTypes={contentTypes}
                selectedType={selectedContentType}
                onSelect={handleContentTypeSelect}
              />
            )}
          </CardContent>
        </Card>

        {/* Step 2: Channel Assignment */}
        {selectedContentType && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </div>
                Assign Channels
              </CardTitle>
              <CardDescription>
                Select which account to use for each platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingChannels ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              ) : (
                <ChannelAssignment
                  availableChannels={availableChannels}
                  assignments={channelAssignments}
                  onAssignmentChange={handleChannelAssignmentChange}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Content & Media */}
        {selectedContentType && channelAssignments.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    3
                  </div>
                  Create Content
                </CardTitle>
                <CardDescription>
                  Write your post content. AI will optimize it for each platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Text Content */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Content</label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What do you want to share with your audience?"
                    rows={6}
                    className="resize-none"
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{content.length} characters</span>
                    {isOptimized && (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Optimized
                      </span>
                    )}
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Hashtags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {hashtags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        #{tag}
                        <button
                          onClick={() => removeHashtag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={handleHashtagKeyDown}
                    placeholder="Type hashtag and press Enter"
                  />
                </div>

                {/* Media Selection */}
                {selectedContentType !== 'text-only' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      {selectedContentType === 'text-video' ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                      {selectedContentType === 'text-video' ? 'Video' : 'Images'}
                    </label>
                    
                    {selectedMedia.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {mediaItems
                          .filter(m => selectedMedia.includes(m._id))
                          .map(media => (
                            <div
                              key={media._id}
                              className="relative h-16 w-16 rounded-md overflow-hidden border"
                            >
                              {media.type === 'video' ? (
                                <video
                                  src={`${media.s3Url}#t=0.1`}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <img
                                  src={media.s3Url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              )}
                              <button
                                onClick={() => setSelectedMedia(prev => prev.filter(id => id !== media._id))}
                                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                      </div>
                    ) : null}
                    
                    <Button
                      variant="outline"
                      onClick={() => setShowMediaLibrary(true)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {selectedMedia.length > 0 ? 'Change Media' : 'Select from Library'}
                    </Button>
                  </div>
                )}

                {/* Optimize Button */}
                <Button
                  onClick={handleOptimizeContent}
                  disabled={!content.trim() || isOptimizing}
                  className="w-full"
                  variant={isOptimized ? 'secondary' : 'default'}
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : isOptimized ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Re-optimize with AI
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Optimize with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Platform Previews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Platform Previews
                </CardTitle>
                <CardDescription>
                  See how your content will appear on each platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {availableChannels?.targetPlatforms.map((platform) => {
                    const assignment = channelAssignments.find(a => a.platform === platform);
                    const channel = availableChannels.channels[platform]?.find(
                      c => c._id === assignment?.channel
                    );
                    const platformContent = optimizedContent[platform] || {
                      enabled: true,
                      content: content,
                      hashtags: hashtags,
                    };

                    if (!channel) return null;

                    return (
                      <PlatformPreviewCard
                        key={platform}
                        platform={platform as Platform}
                        content={platformContent.content || content}
                        title={platformContent.title}
                        hashtags={platformContent.hashtags || hashtags}
                        mediaUrls={mediaUrls}
                        mediaType={mediaType as 'none' | 'image' | 'video'}
                        channelName={channel.displayName}
                        channelAvatar={channel.avatar}
                        isOptimized={isOptimized && !!optimizedContent[platform]}
                        editable={false}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Publish Options */}
        {selectedContentType && channelAssignments.length > 0 && content.trim() && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  4
                </div>
                Publish Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                {/* Publish Type Selection */}
                <div className="flex gap-2">
                  <Button
                    variant={publishType === 'now' ? 'default' : 'outline'}
                    onClick={() => setPublishType('now')}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Publish Now
                  </Button>
                  <Button
                    variant={publishType === 'scheduled' ? 'default' : 'outline'}
                    onClick={() => setPublishType('scheduled')}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>

                {/* Schedule Date */}
                {publishType === 'scheduled' && (
                  <div className="flex-1 max-w-xs">
                    <label className="text-sm font-medium mb-2 block">
                      Schedule Date & Time
                    </label>
                    <Input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}

                {/* Publish Button */}
                <div className="flex-1 flex justify-end">
                  <Button
                    size="lg"
                    onClick={handlePublish}
                    disabled={!canPublish || isPublishing}
                    className="min-w-[200px]"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : publishType === 'now' ? (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Publish to {channelAssignments.length} Platforms
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Post
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Summary */}
              {canPublish && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="h-4 w-4" />
                      {channelAssignments.length} platforms
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {content.length} characters
                    </span>
                    {hashtags.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Hash className="h-4 w-4" />
                        {hashtags.length} hashtags
                      </span>
                    )}
                    {selectedMedia.length > 0 && (
                      <span className="flex items-center gap-1">
                        {mediaType === 'video' ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                        {selectedMedia.length} {mediaType}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Media Library Selector Modal */}
      {showMediaLibrary && (
        <MediaLibrarySelector
          open={showMediaLibrary}
          onOpenChange={setShowMediaLibrary}
          selectedIds={selectedMedia}
          onSelect={(ids, items) => {
            setSelectedMedia(ids);
            setMediaItems(items);
          }}
          mediaType={selectedContentType === 'text-video' ? 'video' : 'image'}
          maxSelection={selectedContentType === 'text-video' ? 1 : 10}
        />
      )}

      {/* Progress Dialog */}
      {currentBulkPost && (
        <BulkPublishProgressDialog
          open={showProgressDialog}
          onOpenChange={setShowProgressDialog}
          status={currentBulkPost.status}
          publishResults={currentBulkPost.publishResults}
          stats={currentBulkPost.stats}
          onViewPosts={() => navigate('/posts')}
          onClose={handleProgressDialogClose}
        />
      )}
    </div>
  );
}