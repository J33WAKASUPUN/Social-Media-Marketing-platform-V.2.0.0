import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrand } from '@/contexts/BrandContext';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Save, Send, CalendarClock, AlertTriangle, CheckCircle2, XCircle, Smile, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { channelApi } from '@/services/channelApi';
import { mediaApi } from '@/services/mediaApi';
import { postApi, type CreatePostData } from '@/services/postApi';
import { getPlatformCapability, type Platform } from '@/lib/platformCapabilities';
import type { Channel, Media } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Components
import { PlatformSelector } from '@/components/post/PlatformSelector';
import { MediaSelector } from '@/components/post/MediaSelector';
import { PlatformWarnings } from '@/components/post/PlatformWarnings';
import { PlatformBadge } from '@/components/PlatformBadge';
import { MediaLibrary } from '@/components/media/MediaLibrary';
import { cn } from '@/lib/utils';

export default function PostComposer() {
  const navigate = useNavigate();
  const { currentBrand } = useBrand();

  // State
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [publishType, setPublishType] = useState<'draft' | 'now' | 'schedule'>('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  
  // Data
  const [channels, setChannels] = useState<Channel[]>([]);
  const [libraryMedia, setLibraryMedia] = useState<Media[]>([]);
  const [selectedLibraryMedia, setSelectedLibraryMedia] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // UI
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Load channels
  useEffect(() => {
    if (currentBrand) {
      fetchChannels();
    }
  }, [currentBrand]);

  // ✅ FIX: Fetch library media when brand changes (for preview purposes)
  useEffect(() => {
    if (currentBrand) {
      fetchLibraryMedia();
    }
  }, [currentBrand]);

  const fetchChannels = async () => {
    try {
      const response = await channelApi.getAll(currentBrand!._id);
      setChannels(response.data.filter(ch => ch.connectionStatus === 'active'));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load channels');
    }
  };

  // ✅ ADD: Fetch library media for preview
  const fetchLibraryMedia = async () => {
    try {
      const response = await mediaApi.getAll({
        brandId: currentBrand!._id,
        limit: 100,
      });
      setLibraryMedia(response.data);
    } catch (error: any) {
      console.error('Failed to load library media:', error);
    }
  };

  // Get selected platform
  const selectedPlatform = useMemo(() => {
    if (!selectedChannel) return null;
    const channel = channels.find(ch => (ch._id || (ch as any).id) === selectedChannel);
    return channel?.provider as Platform || null;
  }, [selectedChannel, channels]);

  // Dynamic character limit
  const maxChars = useMemo(() => {
    if (!selectedPlatform) return 3000;
    return getPlatformCapability(selectedPlatform).limits.maxTextLength;
  }, [selectedPlatform]);

  // Platform warnings
  const warnings = useMemo(() => {
    if (!selectedPlatform) return [];
    return getPlatformCapability(selectedPlatform).warnings;
  }, [selectedPlatform]);

  const hasLimitations = useMemo(() => {
    if (!selectedPlatform) return false;
    return warnings.some(w => w.includes('❌') || w.includes('⚠️'));
  }, [warnings, selectedPlatform]);

  // Check if media is allowed
  const canAddMedia = useMemo(() => {
    if (!selectedPlatform) return true;
    const cap = getPlatformCapability(selectedPlatform);
    return cap.supports.images || cap.supports.videos;
  }, [selectedPlatform]);

  // Media type allowed
  const allowedMediaTypes = useMemo(() => {
    if (!selectedPlatform) return ['image', 'video'];
    
    const cap = getPlatformCapability(selectedPlatform);
    const types: string[] = [];
    if (cap.supports.images) types.push('image');
    if (cap.supports.videos) types.push('video');
    
    return types;
  }, [selectedPlatform]);

  // Calculate totalMediaCount
  const totalMediaCount = uploadedFiles.length + selectedLibraryMedia.length;

  // ✅ FIX: Build preview media from libraryMedia state
  const allPreviewMedia = useMemo(() => {
    const libraryItems = libraryMedia
      .filter(m => selectedLibraryMedia.includes(m._id))
      .map(m => ({
        type: 'library' as const,
        url: m.s3Url,
        id: m._id,
      }));

    const uploadedItems = uploadedFiles.map((file, index) => ({
      type: 'upload' as const,
      url: URL.createObjectURL(file),
      index,
    }));

    return [...libraryItems, ...uploadedItems];
  }, [libraryMedia, selectedLibraryMedia, uploadedFiles]);

  // Reset preview index when media changes
  useEffect(() => {
    setPreviewImageIndex(0);
  }, [totalMediaCount]);

  // --- Handlers ---
  const handleChannelSelect = (channelId: string) => setSelectedChannel(channelId);

  const handleEmojiClick = (emojiObject: { emoji: string }) => {
    const textarea = contentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + emojiObject.emoji + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emojiObject.emoji.length;
        textarea.focus();
      }, 0);
    }
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && hashtagInput.trim() !== '') {
      e.preventDefault();
      const newTag = hashtagInput.trim().startsWith('#') ? hashtagInput.trim() : `#${hashtagInput.trim()}`;
      if (!hashtags.includes(newTag)) {
        setHashtags([...hashtags, newTag]);
      }
      setHashtagInput('');
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };
  
  // ✅ FIX: Open media library and refresh media list
  const openMediaLibrary = async () => {
    try {
      const response = await mediaApi.getAll({
        brandId: currentBrand!._id,
        type: allowedMediaTypes.length === 1 ? allowedMediaTypes[0] as 'image' | 'video' : undefined,
        limit: 50,
      });
      setLibraryMedia(response.data);
      setShowMediaLibrary(true);
    } catch (error: any) {
      toast.error('Failed to load media library');
    }
  };

  const handleLibraryMediaSelect = (mediaId: string) => {
    setSelectedLibraryMedia(prev =>
      prev.includes(mediaId) ? prev.filter(id => id !== mediaId) : [...prev, mediaId]
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (allowedMediaTypes.includes('image') && file.type.startsWith('image/')) return true;
      if (allowedMediaTypes.includes('video') && file.type.startsWith('video/')) return true;
      return false;
    });
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeUploadedFile = (index: number) => setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  
  // ✅ FIX: Define the removeLibraryMedia function properly
  const removeLibraryMedia = (mediaId: string) => {
    setSelectedLibraryMedia(prev => prev.filter(id => id !== mediaId));
  };

  // --- Main Create Logic ---
  const handleCreate = async () => {
    if (!content.trim()) {
      toast.error('Please enter content');
      return;
    }

    if (publishType !== 'draft') {
      if (!selectedChannel) {
        toast.error('Please select a platform');
        return;
      }
      if (publishType === 'schedule' && !scheduledDate) {
        toast.error('Please select a date and time');
        return;
      }
    }

    try {
      setLoading(true);
      
      // 1. Upload new files if any
      let uploadedMediaIds: string[] = [];
      if (uploadedFiles.length > 0) {
        const uploadResponse = await mediaApi.upload(uploadedFiles, {
          brandId: currentBrand._id,
          folder: 'Default',
        });
        uploadedMediaIds = uploadResponse.data.map((m: Media) => m._id);
        console.log('✅ Uploaded new files:', uploadedMediaIds);
      }

      // Combine library + uploaded
      const allMediaIds = [...selectedLibraryMedia, ...uploadedMediaIds];

      // 2. Build Schedules
      let schedules: any[] = [];
      
      if (publishType === 'now') {
        const channel = channels.find(ch => (ch._id || (ch as any).id) === selectedChannel)!;
        // FIX: Use current time, not 10 seconds in future
        const now = new Date();
        // Set to 2 seconds ago to ensure immediate processing
        const scheduledFor = new Date(now.getTime() - 2000).toISOString();
        schedules.push({
          channel: channel._id || (channel as any).id,
          provider: channel.provider,
          scheduledFor,
        });
      } else if (publishType === 'schedule') {
        const channel = channels.find(ch => (ch._id || (ch as any).id) === selectedChannel)!;
        const scheduledFor = new Date(scheduledDate).toISOString();
        
        if (new Date(scheduledFor) <= new Date()) {
          toast.error('Scheduled time must be in the future');
          setLoading(false);
          return;
        }
        
        schedules.push({
          channel: channel._id || (channel as any).id,
          provider: channel.provider,
          scheduledFor,
        });
      }

      // 3. Create Payload
      const postData: CreatePostData = {
        brandId: currentBrand._id,
        content,
        hashtags,
        mediaLibraryIds: allMediaIds,
        schedules,
        settings: { notifyOnPublish: true },
      };

      console.log('📤 Sending create payload:', postData);

      const response = await postApi.create(postData);
      
      // FIX: For "Publish Now", poll for completion
      if (publishType === 'now' && response.data?._id) {
        const postId = response.data._id;
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds max wait
        
        const checkStatus = async (): Promise<boolean> => {
          try {
            const statusResponse = await postApi.getById(postId);
            const post = statusResponse.data;
            
            if (post.status === 'published') {
              return true;
            }
            if (post.status === 'failed') {
              throw new Error(post.schedules?.[0]?.error || 'Publishing failed');
            }
            return false;
          } catch (error) {
            console.error('Status check error:', error);
            return false;
          }
        };
        
        // Poll every second
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
          
          const isComplete = await checkStatus();
          if (isComplete) {
            toast.success('Post published successfully!');
            navigate('/posts');
            return;
          }
        }
        
        // If we get here, it's taking too long
        toast.info('Post is being published. Check the Posts page for status.');
        navigate('/posts');
        return;
      }
      
      const successMessage = publishType === 'draft' 
        ? 'Post saved as draft' 
        : publishType === 'now'
        ? 'Post is being published!'
        : 'Post scheduled successfully';
      
      toast.success(successMessage);
      navigate('/posts');
      
    } catch (error: any) {
      console.error('❌ Create failed:', error);
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  // Determine the exact media type filter
  const mediaTypeFilter = useMemo<'all' | 'image' | 'video'>(() => {
    if (!selectedPlatform) return 'all';
    
    const cap = getPlatformCapability(selectedPlatform);
    
    if (cap.supports.images && cap.supports.videos) return 'all';
    if (cap.supports.videos && !cap.supports.images) return 'video';
    if (cap.supports.images && !cap.supports.videos) return 'image';
    
    return 'all';
  }, [selectedPlatform]);

  // Image navigation
  const nextImage = () => {
    if (totalMediaCount > 0) {
      setPreviewImageIndex((prev) => (prev + 1) % totalMediaCount);
    }
  };

  const prevImage = () => {
    if (totalMediaCount > 0) {
      setPreviewImageIndex((prev) => (prev - 1 + totalMediaCount) % totalMediaCount);
    }
  };

  if (!currentBrand) return <div className="p-6">Please select a brand</div>;

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-background p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/posts')}
          className="mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Posts
        </Button>

        <PageHeader 
          title="Create Post" 
          description="Compose and schedule your social media post" 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Main Editor */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="border-b bg-white dark:bg-card px-6 py-4">
                <CardTitle className="text-lg text-gray-800 dark:text-foreground">Post Content</CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6 bg-card">
                
                {/* 1. PLATFORM SELECTOR */}
                <PlatformSelector
                  channels={channels}
                  selectedChannel={selectedChannel}
                  onSelectChannel={handleChannelSelect}
                  onViewCapabilities={() => setShowWarnings(true)}
                  loading={loading}
                />

                <div className="h-px bg-gray-100 dark:bg-border" />

                {/* 2. TEXT AREA */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-foreground">Content</Label>
                  <div className="relative">
                    <Textarea
                      ref={contentTextareaRef}
                      placeholder="What would you like to share?"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={6}
                      className="resize-none pr-16 text-base focus:border-violet-500 focus:ring-violet-500 bg-background"
                      maxLength={maxChars}
                      disabled={loading}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-gray-400 dark:text-muted-foreground">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-600 dark:text-muted-foreground dark:hover:text-foreground">
                            <Smile className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-0">
                          <EmojiPicker
                            emojiStyle={EmojiStyle.NATIVE}
                            onEmojiClick={handleEmojiClick}
                            width={350}
                            height={400}
                          />
                        </PopoverContent>
                      </Popover>
                      <span className={content.length > maxChars * 0.9 ? 'text-red-500 font-bold' : ''}>
                        {content.length}
                      </span>
                      <span>/</span>
                      <span>{maxChars}</span>
                    </div>
                  </div>
                </div>

                {/* HASHTAGS */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-foreground">Hashtags</Label>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button onClick={() => removeHashtag(tag)} className="rounded-full hover:bg-gray-300 dark:hover:bg-muted">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Type a hashtag and press Enter..."
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={handleHashtagKeyDown}
                    disabled={loading}
                    className="bg-background"
                  />
                </div>

                {/* 3. MEDIA */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-foreground">Media</Label>
                  <MediaSelector
                    canAddMedia={canAddMedia}
                    allowedMediaTypes={allowedMediaTypes}
                    selectedLibraryMedia={selectedLibraryMedia}
                    uploadedFiles={uploadedFiles}
                    libraryMedia={libraryMedia}
                    onOpenLibrary={openMediaLibrary}
                    onFileSelect={handleFileSelect}
                    onRemoveLibraryMedia={removeLibraryMedia}
                    onRemoveUploadedFile={removeUploadedFile}
                    loading={loading}
                  />
                </div>

                {/* 4. IN-LINE WARNINGS */}
                {hasLimitations && selectedChannel && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <PlatformWarnings
                      warnings={warnings}
                      onViewAll={() => setShowWarnings(true)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Publish Settings & Preview */}
          <div className="lg:col-span-4 space-y-6 sticky top-6">
            
            {/* PUBLISH SETTINGS */}
            <Card className="border-none shadow-md">
              <CardHeader className="border-b px-5 py-4 bg-white dark:bg-card">
                <CardTitle className="text-base font-semibold text-foreground">Publish Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5 bg-card">
                <RadioGroup 
                  value={publishType} 
                  onValueChange={(v) => setPublishType(v as typeof publishType)}
                  className="grid grid-cols-1 gap-3"
                >
                  {/* Keep as Draft */}
                  <div>
                    <RadioGroupItem value="draft" id="draft" className="peer sr-only" />
                    <Label
                      htmlFor="draft"
                      className="flex items-center gap-3 rounded-lg border-2 border-muted bg-transparent p-3 hover:bg-gray-50 dark:hover:bg-muted peer-data-[state=checked]:border-violet-600 peer-data-[state=checked]:bg-violet-50 dark:peer-data-[state=checked]:bg-violet-950 peer-data-[state=checked]:text-violet-900 dark:peer-data-[state=checked]:text-violet-100 cursor-pointer transition-all"
                    >
                      <Save className="h-5 w-5" />
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold">Save as Draft</div>
                        <div className="text-xs text-muted-foreground">Edit and publish later</div>
                      </div>
                    </Label>
                  </div>

                  {/* Publish Now */}
                  <div>
                    <RadioGroupItem value="now" id="now" className="peer sr-only" />
                    <Label
                      htmlFor="now"
                      className="flex items-center gap-3 rounded-lg border-2 border-muted bg-transparent p-3 hover:bg-gray-50 dark:hover:bg-muted peer-data-[state=checked]:border-violet-600 peer-data-[state=checked]:bg-violet-50 dark:peer-data-[state=checked]:bg-violet-950 peer-data-[state=checked]:text-violet-900 dark:peer-data-[state=checked]:text-violet-100 cursor-pointer transition-all"
                    >
                      <Send className="h-5 w-5" />
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold">Publish Now</div>
                        <div className="text-xs text-muted-foreground">Post immediately</div>
                      </div>
                    </Label>
                  </div>

                  {/* Schedule */}
                  <div>
                    <RadioGroupItem value="schedule" id="schedule" className="peer sr-only" />
                    <Label
                      htmlFor="schedule"
                      className="flex items-center gap-3 rounded-lg border-2 border-muted bg-transparent p-3 hover:bg-gray-50 dark:hover:bg-muted peer-data-[state=checked]:border-violet-600 peer-data-[state=checked]:bg-violet-50 dark:peer-data-[state=checked]:bg-violet-950 peer-data-[state=checked]:text-violet-900 dark:peer-data-[state=checked]:text-violet-100 cursor-pointer transition-all"
                    >
                      <CalendarClock className="h-5 w-5" />
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold">Schedule</div>
                        <div className="text-xs text-muted-foreground">Pick a date & time</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {publishType === 'schedule' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <Label className="text-sm font-medium">Schedule Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="mt-2 bg-background"
                    />
                  </div>
                )}

                <Button
                  onClick={handleCreate}
                  disabled={loading || !content.trim()}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {publishType === 'now' ? 'Publish Post' : publishType === 'schedule' ? 'Schedule Post' : 'Create Draft'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* PREVIEW CARD */}
            <Card className="border shadow-sm overflow-hidden bg-gray-50/50 dark:bg-card">
              <div className="p-2 border-b bg-white/80 dark:bg-card/80 backdrop-blur text-center">
                <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground uppercase tracking-wide">Live Preview</span>
              </div>
              <CardContent className="p-4">
                {!selectedPlatform ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-gray-400 dark:text-muted-foreground border-2 border-dashed border-gray-200 dark:border-border rounded-lg bg-white dark:bg-muted/20">
                    <Send className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">Select a platform<br/>to see preview</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-card rounded-xl border shadow-sm p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 space-y-2">
                        <p className="text-sm font-bold text-gray-900 dark:text-foreground truncate">Your Brand</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-muted-foreground">
                          <PlatformBadge platform={selectedPlatform} size="sm" />
                          <span>• Just now</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-800 dark:text-foreground whitespace-pre-wrap break-words">
                      {content || <span className="text-gray-300 dark:text-muted-foreground italic">Write something...</span>}
                    </div>

                    {/* HASHTAGS PREVIEW */}
                    {hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {hashtags.map((tag, i) => (
                          <span key={i} className="text-sm text-primary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* ✅ FIX: MEDIA PREVIEW */}
                    {totalMediaCount > 0 && allPreviewMedia.length > 0 && (
                      <div className="relative rounded-lg overflow-hidden bg-gray-100">
                        <div className="aspect-video relative">
      {/* ✅ CHECK IF CURRENT MEDIA IS VIDEO */}
      {allPreviewMedia[previewImageIndex]?.url.match(/\.(mp4|mov|avi|webm)$/i) ? (
        <video
          src={`${allPreviewMedia[previewImageIndex]?.url}#t=0.1`}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Video+Preview';
          }}
        />
      ) : (
        <img
          src={allPreviewMedia[previewImageIndex]?.url}
          alt="Preview"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Preview';
          }}
        />
      )}

                          {totalMediaCount > 1 && (
                            <>
                              <button
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                                aria-label="Previous image"
                              >
                                <ChevronLeft className="h-5 w-5" />
                              </button>
                              <button
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                                aria-label="Next image"
                              >
                                <ChevronRight className="h-5 w-5" />
                              </button>

                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {allPreviewMedia.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setPreviewImageIndex(index)}
                                    className={cn(
                                      "w-2 h-2 rounded-full transition-all",
                                      index === previewImageIndex
                                        ? "bg-white w-6"
                                        : "bg-white/50 hover:bg-white/75"
                                    )}
                                    aria-label={`Go to image ${index + 1}`}
                                  />
                                ))}
                              </div>

                              <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white font-medium">
                                {previewImageIndex + 1} / {totalMediaCount}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CAPABILITIES DIALOG */}
      <Dialog open={showWarnings} onOpenChange={setShowWarnings}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-gray-50/50 dark:bg-card/50">
            <DialogTitle>Platform Limitations</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue={selectedChannel || (channels[0]?._id || (channels[0] as any)?.id)} className="h-full flex">
              <TabsList className="w-48 h-full flex-col justify-start rounded-none border-r bg-gray-50/30 dark:bg-muted/30 p-0 space-y-0">
                {channels.map((ch) => {
                  const id = ch._id || (ch as any).id;
                  return (
                    <TabsTrigger 
                      key={id} 
                      value={id} 
                      className="w-full justify-start px-4 py-3 rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:border-r-2 data-[state=active]:border-violet-600 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-400 border-r-2 border-transparent"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <PlatformBadge platform={ch.provider as Platform} size="sm" />
                        <span className="truncate text-xs">{ch.displayName}</span>
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <div className="flex-1 h-full overflow-y-auto">
                {channels.map((ch) => {
                  const id = ch._id || (ch as any).id;
                  const cap = getPlatformCapability(ch.provider as Platform);
                  
                  return (
                    <TabsContent key={id} value={id} className="m-0 p-6 space-y-6 animate-in fade-in slide-in-from-left-2 duration-200">
                      <div className="flex items-center gap-3">
                        <PlatformBadge platform={ch.provider as Platform} size="lg" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-foreground">{ch.displayName}</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase">Media Support</h4>
                          <div className="space-y-1">
                            <SupportItem supported={cap.supports.text} label="Text Posts" />
                            <SupportItem supported={cap.supports.images} label="Images" />
                            <SupportItem supported={cap.supports.videos} label="Videos" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase">Actions</h4>
                          <div className="space-y-1">
                            <SupportItem supported={cap.supports.update} label="Edit Post" />
                            <SupportItem supported={cap.supports.delete} label="Delete Post" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-muted/30 rounded-lg p-4 border dark:border-border space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-foreground">Platform Limits</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">Character Limit</span>
                            <span className="font-medium text-gray-900 dark:text-white">{cap.limits.maxTextLength}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">Max Images</span>
                            <span className="font-medium text-gray-900 dark:text-white">{cap.limits.maxImages || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">Max Video Size</span>
                            <span className="font-medium text-gray-900 dark:text-white">{cap.limits.maxVideoSize || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">Video Duration</span>
                            <span className="font-medium text-gray-900 dark:text-white">{cap.limits.videoDuration || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-2">Platform Notes</h4>
                        <ul className="space-y-2">
                          {cap.warnings.map((w, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <span>{w.replace('⚠️', '').replace('❌', '').replace('✅', '')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                  );
                })}
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Library Dialog */}
      <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Select Media from Library
              {selectedPlatform && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({selectedPlatform === 'youtube' ? 'Videos only' : 
                    mediaTypeFilter === 'video' ? 'Videos only' :
                    mediaTypeFilter === 'image' ? 'Images only' : 'All media'})
                </span>
              )}
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
    </div>
  );
}

function SupportItem({ supported, label }: { supported: boolean, label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {supported 
        ? <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
        : <XCircle className="h-4 w-4 text-gray-300 dark:text-gray-600" />
      }
      <span className={supported ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
        {label}
      </span>
    </div>
  );
}