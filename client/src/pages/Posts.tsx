import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, FileText, Loader2, HelpCircle, CheckCircle, ExternalLink, Archive, Eye, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeText } from '@/lib/sanitize';
import { useBrand } from "@/contexts/BrandContext";
import { postApi } from "@/services/postApi";
import { Post } from "@/types";
import { toast } from "sonner";

export default function Posts() {
  const navigate = useNavigate();
  const { currentBrand } = useBrand();
  const permissions = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'scheduled' | 'published' | 'failed'>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [showHowItWorksDialog, setShowHowItWorksDialog] = useState(false);

  // Fetch posts when brand changes
  useEffect(() => {
    if (currentBrand) {
      fetchPosts();
    } else {
      setPosts([]);
      setLoading(false);
    }
  }, [currentBrand, filterStatus]);

  const fetchPosts = async () => {
    if (!currentBrand) return;

    setLoading(true);
    try {
      console.log('📥 Fetching posts for brand:', currentBrand._id);
      const response = await postApi.getAll(currentBrand._id);
      console.log('✅ Posts fetched:', response.data);
      setPosts(response.data);
    } catch (error: any) {
      console.error('❌ Fetch posts error:', error);
      toast.error(error.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Sanitize search query to prevent XSS
  const sanitizedSearchQuery = sanitizeText(searchQuery);

  // Filter posts by status AND platform
  const getPostsByStatus = (status?: Post['status']) => {
    let filtered = status 
      ? posts.filter((p) => p.status === status) 
      : posts;

    // Apply platform filter
    if (filterPlatform !== 'all') {
      filtered = filtered.filter(p => 
        p.schedules?.some(s => s.channel.provider === filterPlatform)
      );
    }

    // Apply search filter (sanitized)
    if (sanitizedSearchQuery.trim()) {
      const query = sanitizedSearchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        sanitizeText(p.content).toLowerCase().includes(query) ||
        sanitizeText(p.title || '').toLowerCase().includes(query) ||
        (p.hashtags && p.hashtags.some(tag => 
          sanitizeText(tag).toLowerCase().includes(query)
        ))
      );
    }

    return filtered;
  };

  // Get unique platforms from posts
  const availablePlatforms = Array.from(
    new Set(
      posts.flatMap(post => 
        post.schedules?.map(s => s.channel.provider) || []
      )
    )
  ).sort();

  const allPosts = getPostsByStatus();
  const scheduledPosts = getPostsByStatus("scheduled");
  const publishedPosts = getPostsByStatus("published");
  const draftPosts = getPostsByStatus("draft");
  const failedPosts = getPostsByStatus("failed");

  // ✅ EDIT SCHEDULED POST - Only for Editor+
  const handleEdit = (id: string) => {
    if (!permissions.canCreatePosts) {
      toast.error('You do not have permission to edit posts');
      return;
    }
    navigate(`/posts/edit/${id}`);
  };

  // ✅ CANCEL SCHEDULED POST - Only for Editor+
  const handleCancel = async (id: string) => {
    if (!permissions.canCreatePosts) {
      toast.error('You do not have permission to cancel posts');
      return;
    }

    try {
      const post = posts.find(p => p._id === id);
      if (!post) return;

      const scheduleId = post.schedules?.[0]?._id;
      if (!scheduleId) {
        toast.error('No schedule found to cancel');
        return;
      }

      await postApi.cancelSchedule(id, scheduleId);
      toast.success('Schedule cancelled successfully');
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel schedule');
    }
  };

  // ✅ PUBLISH DRAFT POST - Only for Editor+
  const handlePublish = async (id: string) => {
    if (!permissions.canPublishPosts) {
      toast.error('You do not have permission to publish posts');
      return;
    }
    navigate(`/posts/edit/${id}`);
  };

  // ✅ REMOVE FROM HISTORY (LOCAL DB DELETE ONLY) - Only for Manager+
  const handleRemoveFromHistory = async (id: string) => {
    if (!permissions.canManageBrand) {
      toast.error('You do not have permission to remove posts from history');
      return;
    }

    try {
      await postApi.delete(id);
      toast.success('Post removed from history');
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove post');
    }
  };

  const PostCardSkeleton = () => (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-full bg-muted p-6">
        <FileText className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No posts yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {permissions.canCreatePosts 
          ? 'Create your first post to get started'
          : 'No posts to display'}
      </p>
      {permissions.canCreatePosts && (
        <Button className="mt-4" onClick={() => navigate('/posts/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      )}
    </div>
  );

  if (!currentBrand) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Brand Selected</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Please select a brand to view posts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* ✅ UPDATED PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">
              {permissions.isViewer ? 'Posts History' : 'Submission History'}
            </h1>
            {/* ✅ HOW IT WORKS BUTTON */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowHowItWorksDialog(true)}
            >
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {permissions.isViewer 
              ? 'View all posts submitted to social media platforms'
              : 'This is a log of posts sent to platforms. Changes made here do not affect live posts.'}
          </p>
        </div>
        
        {/* ✅ REFRESH BUTTON + CREATE POST BUTTON */}
        <div className="flex gap-2">
          {/* ✅ REFRESH BUTTON - VISIBLE TO ALL USERS */}
          <Button
            variant="outline"
            onClick={fetchPosts}
            disabled={loading}
            title="Refresh posts"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>

          {/* ✅ Only show Create Post button for users who can create posts */}
          {permissions.canCreatePosts && (
            <Button variant="gradient" className="bg-purple-600" onClick={() => navigate("/posts/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          )}
        </div>
      </div>

      {/* ✅ For viewers, show read-only message */}
      {permissions.isViewer && (
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertTitle>View Only Mode</AlertTitle>
          <AlertDescription>
            You have view-only access. Contact your organization owner to request editing permissions.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" className="space-y-4" onValueChange={(value) => setFilterStatus(value as any)}>
        <TabsList>
          <TabsTrigger value="all">All ({allPosts.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({scheduledPosts.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedPosts.length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({draftPosts.length})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({failedPosts.length})</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {availablePlatforms.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <TabsContent value="all" className="space-y-4">
              {allPosts.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {allPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      // ✅ Only pass handlers if user has permission
                      onRemoveFromHistory={permissions.canManageBrand ? handleRemoveFromHistory : undefined}
                      onEdit={permissions.canCreatePosts ? handleEdit : undefined}
                      onCancel={permissions.canCreatePosts ? handleCancel : undefined}
                      onPublish={permissions.canPublishPosts ? handlePublish : undefined}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-4">
              {scheduledPosts.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {scheduledPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onRemoveFromHistory={permissions.canManageBrand ? handleRemoveFromHistory : undefined}
                      onEdit={permissions.canCreatePosts ? handleEdit : undefined}
                      onCancel={permissions.canCreatePosts ? handleCancel : undefined}
                      onPublish={permissions.canPublishPosts ? handlePublish : undefined}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="published" className="space-y-4">
              {publishedPosts.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {publishedPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onRemoveFromHistory={permissions.canManageBrand ? handleRemoveFromHistory : undefined}
                      onPublish={permissions.canPublishPosts ? handlePublish : undefined}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="draft" className="space-y-4">
              {draftPosts.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {draftPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onRemoveFromHistory={permissions.canManageBrand ? handleRemoveFromHistory : undefined}
                      onEdit={permissions.canCreatePosts ? handleEdit : undefined}
                      onPublish={permissions.canPublishPosts ? handlePublish : undefined}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="failed" className="space-y-4">
              {failedPosts.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {failedPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onRemoveFromHistory={permissions.canManageBrand ? handleRemoveFromHistory : undefined}
                      onEdit={permissions.canCreatePosts ? handleEdit : undefined}
                      onPublish={permissions.canPublishPosts ? handlePublish : undefined}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* ✅ HOW IT WORKS DIALOG */}
      <Dialog open={showHowItWorksDialog} onOpenChange={setShowHowItWorksDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-500" />
              How to Manage Your Posts
            </DialogTitle>
            <DialogDescription>
              This dashboard shows a history of posts sent to social platforms. It does not control live posts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <Alert>
              <AlertTitle className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Step 1: View Your Post on the Platform
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>Click the <strong>"View on [Platform]"</strong> button to open the live post.</p>
                <Button variant="outline" size="sm" className="w-full" disabled>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on LinkedIn
                </Button>
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertTitle className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Step 2: Edit or Delete on the Platform
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p>Use the platform's native tools to edit or delete the post.</p>
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertTitle className="flex items-center gap-2">
                <Archive className="h-4 w-4 text-amber-500" />
                Step 3: Clean Up Your History Log
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>After managing the post on the platform, click <strong>"Remove from History"</strong> to clean up your local log.</p>
                <p className="text-xs text-muted-foreground">
                  ⚠️ This only removes it from your dashboard. It does not affect the live post.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}