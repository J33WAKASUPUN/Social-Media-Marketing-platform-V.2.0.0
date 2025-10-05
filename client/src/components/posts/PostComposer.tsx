import React, { useState } from 'react';
import { 
  Send, 
  Calendar, 
  Image, 
  Video, 
  Hash, 
  AtSign, 
  Save, 
  X, 
  Plus,
  Clock,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockSocialAccounts } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const PostComposer = () => {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'twitter']);
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const { toast } = useToast();

  const platformLimits: Record<string, number> = {
    twitter: 280,
    instagram: 2200,
    facebook: 63206,
    linkedin: 3000,
    youtube: 5000,
    tiktok: 2200,
  };

  const connectedAccounts = mockSocialAccounts.filter(account => account.isConnected);

  const getCurrentLimit = () => {
    if (selectedPlatforms.length === 0) return 280;
    return Math.min(...selectedPlatforms.map(platform => platformLimits[platform] || 280));
  };

  const currentLimit = getCurrentLimit();
  const remaining = currentLimit - content.length;
  const progressValue = (content.length / currentLimit) * 100;

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // In a real app, you'd upload these files and get URLs back
      const mockUrls = Array.from(files).map((_, index) => 
        `https://images.unsplash.com/photo-${1500000000000 + index}?w=400&h=400&fit=crop`
      );
      setMediaFiles(prev => [...prev, ...mockUrls]);
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your post.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Platform required",
        description: "Please select at least one platform to publish to.",
        variant: "destructive",
      });
      return;
    }

    if (isScheduled && (!scheduledDate || !scheduledTime)) {
      toast({
        title: "Schedule required",
        description: "Please select a date and time for your scheduled post.",
        variant: "destructive",
      });
      return;
    }

    // Mock post creation
    const action = isScheduled ? 'scheduled' : 'published';
    toast({
      title: `Post ${action}!`,
      description: `Your post has been ${action} successfully to ${selectedPlatforms.join(', ')}.`,
    });

    // Reset form
    setContent('');
    setMediaFiles([]);
    setIsScheduled(false);
    setScheduledDate('');
    setScheduledTime('');
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your post has been saved as a draft.",
    });
  };

  const suggestedHashtags = ['#SocialMedia', '#Marketing', '#Content', '#Business', '#Growth'];
  const suggestedMentions = ['@partner1', '@influencer2', '@brand3'];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Create Post</h1>
          <p className="text-muted-foreground mt-1">
            Compose and schedule content for your social media accounts.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Composer */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compose Your Post</CardTitle>
              <CardDescription>
                Write engaging content for your audience across multiple platforms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Platform Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Select Platforms ({selectedPlatforms.length} selected)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {connectedAccounts.map((account) => (
                    <div
                      key={account.id}
                      className={`relative cursor-pointer rounded-lg border p-3 transition-all ${
                        selectedPlatforms.includes(account.platform)
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => togglePlatform(account.platform)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={account.avatar} alt={account.platform} />
                          <AvatarFallback className={`platform-${account.platform}`}>
                            {account.platform.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm capitalize">{account.platform}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {account.username}
                          </div>
                        </div>
                      </div>
                      {selectedPlatforms.includes(account.platform) && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Content</Label>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className={remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                      {remaining} characters remaining
                    </span>
                  </div>
                </div>
                <Textarea
                  id="content"
                  placeholder="What's happening? Share your thoughts, updates, or exciting news with your audience..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <Progress 
                  value={Math.min(progressValue, 100)} 
                  className={`h-1 ${progressValue > 100 ? 'bg-destructive/20' : ''}`}
                />
              </div>

              {/* Media Upload */}
              <div className="space-y-3">
                <Label>Media</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {mediaFiles.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMedia(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  
                  <label className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Image className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Add Media</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleMediaUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Scheduling */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="schedule"
                    checked={isScheduled}
                    onCheckedChange={setIsScheduled}
                  />
                  <Label htmlFor="schedule" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Schedule for later
                  </Label>
                </div>

                {isScheduled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Globe className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button onClick={handlePost} className="btn-gradient">
                    {isScheduled ? (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Post
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Publish Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Add */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Add</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Suggested Hashtags</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedHashtags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => setContent(prev => prev + ' ' + tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Mentions</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedMentions.map((mention) => (
                    <Badge
                      key={mention}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => setContent(prev => prev + ' ' + mention)}
                    >
                      {mention}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Previews */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Previews</CardTitle>
              <CardDescription>
                See how your post will appear on each platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={selectedPlatforms[0] || 'instagram'} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  {selectedPlatforms.slice(0, 2).map((platform) => (
                    <TabsTrigger key={platform} value={platform} className="capitalize">
                      {platform}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {selectedPlatforms.map((platform) => (
                  <TabsContent key={platform} value={platform} className="mt-4">
                    <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={`platform-${platform}`}>
                            {platform.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">Your Account</div>
                          <div className="text-xs text-muted-foreground capitalize">{platform}</div>
                        </div>
                      </div>
                      
                      {content && (
                        <p className="text-sm">{content}</p>
                      )}
                      
                      {mediaFiles.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {mediaFiles.slice(0, 4).map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Media ${index + 1}`}
                              className="aspect-square object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>Preview</span>
                        <span>{platformLimits[platform]} char limit</span>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;