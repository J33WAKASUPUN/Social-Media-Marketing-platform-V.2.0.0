import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Loader2 } from 'lucide-react';

// Components
import { PlatformSelector } from '@/components/post/PlatformSelector';
import { MediaSelector } from '@/components/post/MediaSelector';
import { PlatformWarnings } from '@/components/post/PlatformWarnings';
import { PlatformBadge } from '@/components/PlatformBadge';
import { MediaLibrary } from '@/components/media/MediaLibrary';
import { cn } from '@/lib/utils';
import { PublishingProgressDialog } from '@/components/post/PublishingProgressDialog';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBrand } = useBrand();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [publishType, setPublishType] = useState<'draft' | 'now' | 'schedule'>('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'publishing' | 'success' | 'error'>('publishing');
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishMessage, setPublishMessage] = useState('');
  
  // Data
  const [originalPost, setOriginalPost] = useState<any>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [libraryMedia, setLibraryMedia] = useState<Media[]>([]);
  const [selectedLibraryMedia, setSelectedLibraryMedia] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    
  // UI
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Load post data
  useEffect(() => {
    if (id && currentBrand) {
      fetchPost();
      fetchChannels();
    }
  }, [id, currentBrand]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await postApi.getById(id!);
      const post = response.data;
      
      // ✅ Can only edit drafts and scheduled posts
      if (post.status === 'published') {
        toast.error('Cannot edit published posts');
        navigate('/posts');
        return;
      }

      setOriginalPost(post);
      setContent(post.content);
      setHashtags(post.hashtags || []);
      
      // ✅ FIX: Load media from library items ONLY
      if (post.mediaLibraryItems && post.mediaLibraryItems.length > 0) {
        const mediaIds = Array.isArray(post.mediaLibraryItems) 
          ? post.mediaLibraryItems.map((m: any) => typeof m === 'string' ? m : m._id)
          : [];
        
        console.log('📚 Loading media from library:', mediaIds);
        setSelectedLibraryMedia(mediaIds);
        
        // Fetch full media objects for preview
        try {
          const mediaResponse = await mediaApi.getAll({
            brandId: currentBrand!._id,
            limit: 50,
          });
          setLibraryMedia(mediaResponse.data);
        } catch (error) {
          console.error('Failed to load library media:', error);
        }
      }
      // ✅ NEW: If post has mediaUrls but no mediaLibraryItems, it means media was uploaded during post creation
      // These are orphaned URLs - we can't edit them, so show a warning
      else if (post.mediaUrls && post.mediaUrls.length > 0) {
        console.log('⚠️ Post has mediaUrls but no library items - these cannot be edited');
        toast.warning('Some media in this post cannot be edited. Please add new media from the library.');
      }

      // Set channel if exists
      if (post.schedules && post.schedules.length > 0) {
        const channelId = post.schedules[0].channel._id;
        setSelectedChannel(channelId);
        
        // Set scheduled date
        const scheduledFor = new Date(post.schedules[0].scheduledFor);
        const localDateTime = new Date(scheduledFor.getTime() - scheduledFor.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setScheduledDate(localDateTime);
        setPublishType('schedule');
      } else {
        setPublishType('draft');
      }
      
    } catch (error: any) {
      toast.error('Failed to load post');
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await channelApi.getAll(currentBrand!._id);
      // ✅ FILTER: Exclude WhatsApp channels (WhatsApp is for messaging, not post publishing)
      const socialChannels = response.data.filter(
        (ch: Channel) => ch.connectionStatus === 'active' && ch.provider !== 'whatsapp'
      );
      setChannels(socialChannels);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load channels');
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

  // ✅ SIMPLIFIED: Calculate total media count
  const totalMediaCount = uploadedFiles.length + selectedLibraryMedia.length;

  // ✅ SIMPLIFIED: Preview media (only library + uploads, no duplicates)
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
  const removeLibraryMedia = (mediaId: string) => setSelectedLibraryMedia(prev => prev.filter(id => id !== mediaId));

// --- Save & Update ---
const handleUpdate = async () => {
  if (!currentBrand || !content.trim()) {
    toast.error('Please enter some content');
    return;
  }

  // Validate based on publish type
  if (publishType === 'now' || publishType === 'schedule') {
    if (!selectedChannel) {
      toast.error('Please select a platform');
      return;
    }
    if (publishType === 'schedule' && !scheduledDate) {
      toast.error('Please select a date and time');
      return;
    }
  }

  const currentPublishType = publishType;
  
  try {
    setSaving(true);
    
    if (currentPublishType === 'now') {
      setShowPublishDialog(true);
      setPublishStatus('publishing');
      setPublishProgress(10);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    let progressInterval: NodeJS.Timeout | null = null;
    if (currentPublishType === 'now') {
      progressInterval = setInterval(() => {
        setPublishProgress(prev => {
          if (prev >= 40) {
            if (progressInterval) clearInterval(progressInterval);
            return 40;
          }
          return prev + 5;
        });
      }, 200);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      if (progressInterval) clearInterval(progressInterval);
      setPublishProgress(40);
    }
    
    let uploadedMediaIds: string[] = [];
    if (uploadedFiles.length > 0) {
      if (currentPublishType === 'now') setPublishProgress(45);
      
      const uploadResponse = await mediaApi.upload(uploadedFiles, {
        brandId: currentBrand._id,
        folder: 'Default',
      });
      uploadedMediaIds = uploadResponse.data.map((m: Media) => m._id);
      console.log('✅ Uploaded new files:', uploadedMediaIds);
      
      if (currentPublishType === 'now') setPublishProgress(55);
    }

    const allMediaIds = [...selectedLibraryMedia, ...uploadedMediaIds];

    const updates: any = {
      content,
      hashtags,
      mediaLibraryIds: allMediaIds,
    };

    console.log('📤 Sending update:', {
      publishType: currentPublishType,
      mediaLibraryIds: allMediaIds,
      totalMedia: allMediaIds.length,
      selectedChannel,
      scheduledDate,
    });

    if (currentPublishType === 'draft') {
      updates.schedules = [];
      updates.status = 'draft';
    }
    else if (currentPublishType === 'now') {
      const channel = channels.find(ch => (ch._id || (ch as any).id) === selectedChannel);
      if (!channel) {
        toast.error('Selected channel not found');
        setSaving(false);
        if (currentPublishType === 'now') {
          setPublishStatus('error');
          setPublishMessage('Selected channel not found');
        }
        return;
      }

      const now = new Date();
      const scheduledFor = new Date(now.getTime() - 2000).toISOString();
      
      updates.schedules = [{
        channel: channel._id || (channel as any).id,
        provider: channel.provider,
        scheduledFor,
      }];
      
      setPublishProgress(60);
    }
    else if (currentPublishType === 'schedule') {
      const channel = channels.find(ch => (ch._id || (ch as any).id) === selectedChannel);
      if (!channel) {
        toast.error('Selected channel not found');
        setSaving(false);
        return;
      }

      const scheduledFor = new Date(scheduledDate).toISOString();
      
      if (new Date(scheduledFor) <= new Date()) {
        toast.error('Scheduled time must be in the future');
        setSaving(false);
        return;
      }
      
      updates.schedules = [{
        channel: channel._id || (channel as any).id,
        provider: channel.provider,
        scheduledFor,
      }];
    }

    console.log('📤 Final update payload:', updates);

    if (currentPublishType === 'now') setPublishProgress(70);
    
    // ✅ FIX: Get the updated post with NEW schedule IDs
    const updateResponse = await postApi.update(id!, updates);
    const updatedPost = updateResponse.data;
    
    if (currentPublishType === 'now') setPublishProgress(75);
    
    // ✅ FIX: For "Publish Now", poll using the NEW schedule ID from the response
    if (currentPublishType === 'now') {
      // Get the first schedule from the updated post (it will be the newly created one)
      const newSchedule = updatedPost.schedules?.[0];
      
      if (!newSchedule) {
        console.error('❌ No schedule found in updated post');
        setPublishProgress(100);
        setPublishStatus('error');
        setPublishMessage('Failed to create schedule');
        setSaving(false);
        return;
      }
      
      const newScheduleId = newSchedule._id;
      console.log('🔄 Starting polling with NEW schedule ID:', newScheduleId);
      
      let attempts = 0;
      const maxAttempts = 30;
      
      setPublishProgress(80);
      
      const checkStatus = async (): Promise<'published' | 'failed' | 'pending'> => {
        try {
          const statusResponse = await postApi.getById(id!);
          const post = statusResponse.data;
          
          // Find the specific schedule we're tracking
          const schedule = post.schedules.find(s => s._id === newScheduleId);
          
          if (!schedule) {
            console.error('❌ Schedule not found in post:', newScheduleId);
            throw new Error('Schedule not found');
          }
          
          console.log(`📊 Poll attempt ${attempts + 1}: schedule status = ${schedule.status}, post status = ${post.status}`);
          
          if (schedule.status === 'published' || post.status === 'published') {
            return 'published';
          }
          if (schedule.status === 'failed' || post.status === 'failed') {
            const errorMsg = schedule.error || 'Publishing failed';
            console.error('❌ Post failed:', errorMsg);
            throw new Error(errorMsg);
          }
          return 'pending';
        } catch (error) {
          console.error('❌ Status check error:', error);
          throw error;
        }
      };
      
      while (attempts < maxAttempts) {
        attempts++;
        
        const progressIncrement = 75 + Math.min(attempts * 0.7, 20);
        setPublishProgress(Math.floor(progressIncrement));
        
        try {
          const statusResult = await checkStatus();
          
          if (statusResult === 'published') {
            console.log('✅ Post published successfully!');
            setPublishProgress(100);
            setPublishStatus('success');
            setPublishMessage('Your updated post is now live!');
            
            setTimeout(() => {
              setShowPublishDialog(false);
              setSaving(false);
              navigate('/posts');
            }, 3000);
            
            return;
          }
        } catch (error: any) {
          setPublishProgress(100);
          setPublishStatus('error');
          setPublishMessage(error.message || 'Failed to publish post');
          setSaving(false);
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.warn('⚠️ Polling timeout');
      setPublishProgress(100);
      setPublishStatus('success');
      setPublishMessage('Post is being published. Check the Posts page for status.');
      
      setTimeout(() => {
        setShowPublishDialog(false);
        setSaving(false);
        navigate('/posts');
      }, 3000);
      
      return;
    }
    
    const successMessage = currentPublishType === 'draft' 
      ? 'Post saved as draft' 
      : 'Post scheduled successfully';
    
    toast.success(successMessage);
    setSaving(false);
    navigate('/posts');
    
  } catch (error: any) {
    console.error('❌ Update failed:', error);
    
    if (currentPublishType === 'now') {
      setPublishProgress(100);
      setPublishStatus('error');
      setPublishMessage(error.response?.data?.message || 'Failed to publish post');
    } else {
      toast.error(error.response?.data?.message || 'Failed to update post');
    }
    setSaving(false);
  }
};

const handlePublishDialogClose = () => {
  if (publishStatus === 'publishing') {
    return; // Don't allow closing during publishing
  }
  
  setShowPublishDialog(false);
  
  if (publishStatus === 'success') {
    navigate('/posts');
  } else if (publishStatus === 'error') {
    setPublishStatus('publishing');
    setPublishProgress(0);
  }
};

  // Determine the exact media type filter for the selected platform
  const mediaTypeFilter = useMemo<'all' | 'image' | 'video'>(() => {
    if (!selectedPlatform) return 'all';
    
    const cap = getPlatformCapability(selectedPlatform);
    
    if (cap.supports.images && cap.supports.videos) return 'all';
    if (cap.supports.videos && !cap.supports.images) return 'video';
    if (cap.supports.images && !cap.supports.videos) return 'image';
    
    return 'all';
  }, [selectedPlatform]);

  // ✅ Image navigation
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

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!currentBrand || !originalPost) return null;

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
          title="Edit Post" 
          description={`Editing ${originalPost.status === 'draft' ? 'draft' : 'scheduled'} post`} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Main Editor */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="border-b bg-white dark:bg-card px-6 py-4">
                <CardTitle className="text-lg text-gray-800 dark:text-foreground">Edit Content</CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6 bg-card">
                
                {/* 1. PLATFORM SELECTOR */}
                <PlatformSelector
                  channels={channels}
                  selectedChannel={selectedChannel}
                  onSelectChannel={handleChannelSelect}
                  onViewCapabilities={() => setShowWarnings(true)}
                  loading={saving}
                />

                <div className="h-px bg-gray-100 dark:bg-border" />

                {/* 2. TEXT AREA */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-foreground">Content</Label>
                  <div className="relative">
                    <Textarea
                      ref={contentTextareaRef}
                      placeholder={selectedPlatform ? `Write for ${selectedPlatform}...` : "What do you want to share?"}
                      className="min-h-[200px] resize-none text-base p-4 border-gray-200 dark:border-border focus-visible:ring-violet-500 bg-background"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      maxLength={maxChars}
                      disabled={saving}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/90 dark:bg-card/90 px-2 py-1 rounded text-xs text-gray-500 dark:text-muted-foreground border shadow-sm">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
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
                    disabled={saving}
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
                    onOpenLibrary={() => setShowMediaLibrary(true)}
                    onFileSelect={handleFileSelect}
                    onRemoveLibraryMedia={removeLibraryMedia}
                    onRemoveUploadedFile={removeUploadedFile}
                    loading={saving}
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

          {/* RIGHT COLUMN: Publish Settings */}
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
                        <div className="text-xs text-muted-foreground">Keep editing later</div>
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
                        <div className="text-xs text-muted-foreground">Pick date & time</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {publishType === 'schedule' && (
                  <div className="pt-2 animate-in fade-in">
                    <Label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-muted-foreground">Select Date & Time</Label>
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full rounded-lg border border-gray-200 dark:border-border bg-background px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                )}

                <Button 
                  variant="gradient" 
                  className="w-full bg-purple-600" 
                  onClick={handleUpdate}
                  disabled={saving || !content.trim()}
                >
                  {saving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Post
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
                    )
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
                           <h4 className="text-sm font-semibold text-gray-900 dark:text-foreground">Hard Limits</h4>
                           <div className="grid grid-cols-2 gap-y-4 text-sm">
                              <div>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">Max Text</span>
                                <span className="font-medium text-gray-900 dark:text-white">{cap.limits.maxTextLength.toLocaleString()} chars</span>
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
                                 <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-muted-foreground bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-100 dark:border-amber-900/50">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                                    <span>{w.replace('⚠️', '').replace('❌', '').replace('✅', '')}</span>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     </TabsContent>
                   )
                 })}
              </div>
            </Tabs>
          </div>
          <DialogFooter className="p-4 border-t bg-white dark:bg-card">
             <Button onClick={() => setShowWarnings(false)}>Close</Button>
          </DialogFooter>
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
      <PublishingProgressDialog
        open={showPublishDialog}
        status={publishStatus}
        progress={publishProgress}
        message={publishMessage}
        onClose={handlePublishDialogClose}
      />
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
   )
}