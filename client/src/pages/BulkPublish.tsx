import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ContentTypeSelector } from '@/components/ContentTypeSelector';
import { ChannelAssignment } from '@/components/ChannelAssignment';
import { PlatformPreviewCard } from '@/components/PlatformPreviewCard';
import { BulkPublishProgressDialog } from '@/components/BulkPublishProgressDialog';
import { MediaLibrary } from '@/components/media/MediaLibrary';
import { useBrand } from '@/contexts/BrandContext';
import { mediaApi } from '@/services/mediaApi';
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
  CheckCircle2,
  Layers,
  FileText,
  Hash,
  Upload,
  FolderOpen,
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
  
  // Media - Same pattern as PostComposer
  const [libraryMedia, setLibraryMedia] = useState<Media[]>([]);
  const [selectedLibraryMedia, setSelectedLibraryMedia] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
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

  // Polling ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const pollingCountRef = useRef<number>(0);

  // Track enabled platforms (users can toggle these)
  const [enabledPlatforms, setEnabledPlatforms] = useState<string[]>([]);


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

  // Fetch library media when brand changes
  useEffect(() => {
    if (currentBrand) {
      fetchLibraryMedia();
    }
  }, [currentBrand]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  // Fetch library media for preview
  const fetchLibraryMedia = async () => {
    try {
      const response = await mediaApi.getAll({
        brandId: currentBrand!._id,
        limit: 100,
      });
      setLibraryMedia(response.data || []);
    } catch (error: any) {
      console.error('Failed to load library media:', error);
    }
  };

  // ✅ Poll for bulk post status updates
  const pollBulkPostStatus = useCallback(async (bulkPostId: string) => {
    try {
      pollingCountRef.current += 1;
      console.log(`📊 Polling attempt #${pollingCountRef.current} for bulk post:`, bulkPostId);
      
      const response = await bulkPublishApi.getById(bulkPostId);
      const updatedBulkPost = response.data;
      
      console.log('📊 Poll response:', {
        status: updatedBulkPost.status,
        stats: updatedBulkPost.stats,
        results: updatedBulkPost.publishResults?.map(r => ({ 
          platform: r.platform, 
          status: r.status 
        }))
      });
      
      setCurrentBulkPost(updatedBulkPost);

      // Check if publishing is complete
      const isComplete = ['completed', 'partial', 'failed', 'cancelled'].includes(updatedBulkPost.status);
      
      // Also check if all results are done (backup check)
      const allResultsDone = updatedBulkPost.publishResults?.every(
        r => ['published', 'failed', 'cancelled'].includes(r.status)
      );
      
      if (isComplete || allResultsDone) {
        console.log('✅ Publishing complete, stopping polling');
        
        // Stop polling
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }

        // Show appropriate toast
        if (updatedBulkPost.status === 'completed' || updatedBulkPost.stats.successCount === updatedBulkPost.stats.totalPlatforms) {
          toast.success(`Successfully published to ${updatedBulkPost.stats.successCount} platforms!`);
        } else if (updatedBulkPost.status === 'partial' || (updatedBulkPost.stats.successCount > 0 && updatedBulkPost.stats.failedCount > 0)) {
          toast.warning(`Published to ${updatedBulkPost.stats.successCount}/${updatedBulkPost.stats.totalPlatforms} platforms`);
        } else if (updatedBulkPost.status === 'failed' || updatedBulkPost.stats.failedCount === updatedBulkPost.stats.totalPlatforms) {
          toast.error('Publishing failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Polling error:', error);
    }
  }, []);

  // Start polling function
  const startPolling = useCallback((bulkPostId: string) => {
    // Reset polling count
    pollingCountRef.current = 0;
    
    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    console.log('🔄 Starting polling for bulk post:', bulkPostId);

    // Poll immediately
    pollBulkPostStatus(bulkPostId);

    // Then poll every 2 seconds
    pollingRef.current = setInterval(() => {
      pollBulkPostStatus(bulkPostId);
    }, 2000);

    // Auto-stop polling after 3 minutes (safety net)
    setTimeout(() => {
      if (pollingRef.current) {
        console.log('⏰ Polling timeout reached, stopping...');
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }, 180000);
  }, [pollBulkPostStatus]);

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
      
      // Auto-enable only platforms that have connected channels
      const connectedPlatforms = response.data.targetPlatforms.filter(
        platform => (response.data.channels[platform]?.length || 0) > 0
      );
      setEnabledPlatforms(connectedPlatforms);
      
      // Auto-assign first channel for each connected platform
      const autoAssignments: ChannelAssignmentType[] = [];
      for (const platform of connectedPlatforms) {
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
    setEnabledPlatforms([]);
    setSelectedLibraryMedia([]);
    setUploadedFiles([]);
    setIsOptimized(false);
    setOptimizedContent({});
  };

    const handlePlatformToggle = (platform: string, enabled: boolean) => {
    setEnabledPlatforms(prev => {
      if (enabled) {
        // Enable platform and auto-assign first channel
        const platformChannels = availableChannels?.channels[platform];
        if (platformChannels && platformChannels.length > 0) {
          // Add channel assignment if not exists
          const hasAssignment = channelAssignments.some(a => a.platform === platform);
          if (!hasAssignment) {
            setChannelAssignments(prevAssignments => [
              ...prevAssignments,
              { platform, channel: platformChannels[0]._id }
            ]);
          }
        }
        return [...prev, platform];
      } else {
        // Disable platform and remove assignment
        setChannelAssignments(prevAssignments => 
          prevAssignments.filter(a => a.platform !== platform)
        );
        return prev.filter(p => p !== platform);
      }
    });
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
    
    // Ensure platform is enabled when channel is selected
    if (!enabledPlatforms.includes(platform)) {
      setEnabledPlatforms(prev => [...prev, platform]);
    }
  };

    const activeAssignments = useMemo(() => {
    return channelAssignments.filter(a => enabledPlatforms.includes(a.platform));
  }, [channelAssignments, enabledPlatforms]);

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && hashtagInput.trim()) {
      e.preventDefault();
      // Remove # if user types it
      const newTag = hashtagInput.trim().replace(/^#/, '');
      if (newTag && !hashtags.includes(newTag)) {
        setHashtags([...hashtags, newTag]);
      }
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  // ✅ Media handlers - Same as PostComposer
  const openMediaLibrary = async () => {
    try {
      const response = await mediaApi.getAll({
        brandId: currentBrand!._id,
        type: selectedContentType === 'text-video' ? 'video' : selectedContentType === 'text-image' ? 'image' : undefined,
        limit: 100,
      });
      setLibraryMedia(response.data || []);
      setShowMediaLibrary(true);
    } catch (error: any) {
      toast.error('Failed to load media library');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowedTypes = selectedContentType === 'text-video' ? ['video'] : ['image'];
    
    const validFiles = files.filter(file => {
      if (allowedTypes.includes('image') && file.type.startsWith('image/')) return true;
      if (allowedTypes.includes('video') && file.type.startsWith('video/')) return true;
      return false;
    });
    
    if (validFiles.length !== files.length) {
      toast.error(`Some files were skipped. Only ${allowedTypes.join(' or ')} files are allowed.`);
    }
    
    // For video, only allow 1 file
    if (selectedContentType === 'text-video') {
      setUploadedFiles(validFiles.slice(0, 1));
      setSelectedLibraryMedia([]); // Clear library selection
    } else {
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeLibraryMedia = (mediaId: string) => {
    setSelectedLibraryMedia(prev => prev.filter(id => id !== mediaId));
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
      
      // Merge hashtags into optimized content
      const optimizedWithHashtags: Record<string, PlatformContent> = {};
      for (const [platform, platformContent] of Object.entries(response.data.platformContent)) {
        optimizedWithHashtags[platform] = {
          ...platformContent,
          hashtags: hashtags,
        };
      }
      
      setOptimizedContent(optimizedWithHashtags);
      setIsOptimized(true);
      toast.success('Content optimized for all platforms!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to optimize content');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle content change from preview card edit
  const handlePlatformContentChange = (platform: string, newContent: string) => {
    setOptimizedContent(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        content: newContent,
      },
    }));
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

    // ✅ UPDATED: Check active assignments instead of all platforms
    if (activeAssignments.length === 0) {
      toast.error('Please enable at least one platform and assign a channel');
      return;
    }

    // ✅ REMOVED: Strict check for all platforms - now optional

    if (publishType === 'scheduled' && !scheduledDate) {
      toast.error('Please select a scheduled date and time');
      return;
    }

    if (publishType === 'scheduled' && new Date(scheduledDate) <= new Date()) {
      toast.error('Scheduled time must be in the future');
      return;
    }

    // Media validation
    const totalMedia = selectedLibraryMedia.length + uploadedFiles.length;
    if (selectedContentType === 'text-image' && totalMedia === 0) {
      toast.error('Please select at least one image');
      return;
    }
    if (selectedContentType === 'text-video' && totalMedia === 0) {
      toast.error('Please select a video');
      return;
    }

    try {
      setIsPublishing(true);
      setShowProgressDialog(true);

      // Upload new files first if any
      let uploadedMediaIds: string[] = [];
      if (uploadedFiles.length > 0) {
        console.log('📤 Uploading files first...');
        const uploadResponse = await mediaApi.upload(uploadedFiles, {
          brandId: currentBrand._id,
          folder: 'Default',
        });
        uploadedMediaIds = uploadResponse.data.map((m: Media) => m._id);
        console.log('✅ Uploaded files:', uploadedMediaIds);
      }

      // Combine library + uploaded media IDs
      const allMediaIds = [...selectedLibraryMedia, ...uploadedMediaIds];

      console.log('📤 Creating bulk post with:', {
        hashtags,
        enabledPlatforms,
        activeAssignments: activeAssignments.length,
      });

      // ✅ UPDATED: Only send active assignments
      const response = await bulkPublishApi.create({
        brandId: currentBrand._id,
        contentType: selectedContentType,
        content,
        hashtags,
        mediaLibraryIds: allMediaIds,
        channelAssignments: activeAssignments, // ✅ Only enabled platforms
        publishType,
        scheduledFor: publishType === 'scheduled' ? scheduledDate : undefined,
        settings: {
          notifyOnComplete: true,
          retryOnFail: true,
        },
      });

      setCurrentBulkPost(response.data);
      
      // Start polling for status updates (only for immediate publish)
      if (publishType === 'now') {
        startPolling(response.data._id);
      } else {
        toast.success(`Bulk post scheduled to ${activeAssignments.length} platforms!`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create bulk post');
      setShowProgressDialog(false);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleProgressDialogClose = () => {
    // Stop polling when dialog closes
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    
    setShowProgressDialog(false);
    
    if (currentBulkPost?.status === 'completed' || currentBulkPost?.status === 'partial') {
      navigate('/posts');
    }
  };

  // Get media URLs for preview
  const mediaUrls = useMemo(() => {
    const libraryUrls = libraryMedia
      .filter(m => selectedLibraryMedia.includes(m._id))
      .map(m => m.s3Url);
    
    const uploadedUrls = uploadedFiles.map(file => URL.createObjectURL(file));
    
    return [...libraryUrls, ...uploadedUrls];
  }, [libraryMedia, selectedLibraryMedia, uploadedFiles]);

  const mediaType = useMemo(() => {
    if (selectedContentType === 'text-video') return 'video';
    if (selectedContentType === 'text-image') return 'image';
    return 'none';
  }, [selectedContentType]);

  // Total media count
  const totalMediaCount = selectedLibraryMedia.length + uploadedFiles.length;

  // Media type filter for library
  const mediaTypeFilter = useMemo<'all' | 'image' | 'video'>(() => {
    if (selectedContentType === 'text-video') return 'video';
    if (selectedContentType === 'text-image') return 'image';
    return 'all';
  }, [selectedContentType]);

  // Check if ready to publish
  const canPublish = useMemo(() => {
    if (!selectedContentType || !content.trim()) return false;
    if (activeAssignments.length === 0) return false;
    if (selectedContentType === 'text-image' && totalMediaCount === 0) return false;
    if (selectedContentType === 'text-video' && totalMediaCount === 0) return false;
    if (publishType === 'scheduled' && !scheduledDate) return false;
    return true;
  }, [selectedContentType, content, activeAssignments, totalMediaCount, publishType, scheduledDate]);


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
                Select Platforms & Channels
              </CardTitle>
              <CardDescription>
                Toggle platforms on/off and select which account to use for each. 
                <span className="text-primary font-medium ml-1">
                  {activeAssignments.length > 0 
                    ? `Publishing to ${activeAssignments.length} platform${activeAssignments.length !== 1 ? 's' : ''}`
                    : 'No platforms selected'}
                </span>
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
                  onPlatformToggle={handlePlatformToggle}
                  enabledPlatforms={enabledPlatforms}
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
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {hashtags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 text-primary">
                          #{tag}
                          <button
                            onClick={() => removeHashtag(tag)}
                            className="ml-1 hover:text-destructive rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Input
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={handleHashtagKeyDown}
                    placeholder="Type hashtag and press Enter (without #)"
                  />
                  {hashtags.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {hashtags.length} hashtag{hashtags.length !== 1 ? 's' : ''} will be added to all posts
                    </p>
                  )}
                </div>

                {/* ✅ Media Selection - Same pattern as PostComposer */}
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
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-3">
                      <Button
                        variant="outline"
                        onClick={openMediaLibrary}
                        className="flex-1"
                      >
                        <FolderOpen className="mr-2 h-4 w-4" />
                        From Library
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('bulk-file-upload')?.click()}
                        className="flex-1"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Files
                      </Button>
                      <input
                        id="bulk-file-upload"
                        type="file"
                        multiple={selectedContentType !== 'text-video'}
                        accept={selectedContentType === 'text-video' ? 'video/*' : 'image/*'}
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {/* Selected Media Preview */}
                    {totalMediaCount > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Selected Media ({totalMediaCount})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {/* Library media */}
                          {libraryMedia
                            .filter(m => selectedLibraryMedia.includes(m._id))
                            .map(media => (
                              <div
                                key={media._id}
                                className="relative h-16 w-16 rounded-md overflow-hidden border group"
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
                                  onClick={() => removeLibraryMedia(media._id)}
                                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                <Badge className="absolute bottom-0 left-0 text-[10px] rounded-none rounded-tr-md">
                                  Library
                                </Badge>
                              </div>
                            ))}

                          {/* Uploaded files */}
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="relative h-16 w-16 rounded-md overflow-hidden border group"
                            >
                              {file.type.startsWith('video/') ? (
                                <video
                                  src={URL.createObjectURL(file)}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              )}
                              <button
                                onClick={() => removeUploadedFile(index)}
                                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <Badge variant="secondary" className="absolute bottom-0 left-0 text-[10px] rounded-none rounded-tr-md">
                                Upload
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                  <Badge variant="secondary" className="ml-2">
                    {activeAssignments.length} selected
                  </Badge>
                </CardTitle>
                <CardDescription>
                  See how your content will appear on each platform. Click the eye icon to view/edit full content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {/* Only show enabled platforms */}
                  {enabledPlatforms.map((platform) => {
                    const assignment = channelAssignments.find(a => a.platform === platform);
                    const channel = availableChannels?.channels[platform]?.find(
                      c => c._id === assignment?.channel
                    );
                    
                    // Get platform content with hashtags
                    const platformContent = optimizedContent[platform];
                    const displayContent = platformContent?.content || content;
                    const displayHashtags = hashtags;

                    if (!channel) return null;

                    return (
                      <PlatformPreviewCard
                        key={platform}
                        platform={platform as Platform}
                        content={displayContent}
                        title={platformContent?.title}
                        hashtags={displayHashtags}
                        mediaUrls={mediaUrls}
                        mediaType={mediaType as 'none' | 'image' | 'video'}
                        channelName={channel.displayName}
                        channelAvatar={channel.avatar}
                        isOptimized={isOptimized && !!optimizedContent[platform]}
                        editable={true}
                        onContentChange={(newContent) => handlePlatformContentChange(platform, newContent)}
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
                        Publish to {activeAssignments.length} Platform{activeAssignments.length !== 1 ? 's' : ''}
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule to {activeAssignments.length} Platform{activeAssignments.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Summary - UPDATED */}
              {canPublish && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="h-4 w-4" />
                      {activeAssignments.length} platform{activeAssignments.length !== 1 ? 's' : ''}
                      <span className="text-xs text-muted-foreground">
                        ({enabledPlatforms.join(', ')})
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {content.length} characters
                    </span>
                    {hashtags.length > 0 && (
                      <span className="flex items-center gap-1 text-primary">
                        <Hash className="h-4 w-4" />
                        {hashtags.length} hashtags
                      </span>
                    )}
                    {totalMediaCount > 0 && (
                      <span className="flex items-center gap-1">
                        {mediaType === 'video' ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                        {totalMediaCount} {mediaType}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Media Library Dialog - Same as PostComposer */}
      <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Select Media from Library
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({mediaTypeFilter === 'video' ? 'Videos only' : 
                  mediaTypeFilter === 'image' ? 'Images only' : 'All media'})
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <MediaLibrary
              brandId={currentBrand._id}
              isDialogMode={true}
              initialSelectedIds={selectedLibraryMedia}
              onSelectionChange={setSelectedLibraryMedia}
              initialMediaTypeFilter={mediaTypeFilter}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMediaLibrary(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowMediaLibrary(false)} className="bg-violet-600 hover:bg-violet-700">
              Add Selected ({selectedLibraryMedia.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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