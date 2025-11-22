import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, TrendingUp, Users, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useBrand } from "@/contexts/BrandContext";
import { postApi } from "@/services/postApi";
import { analyticsApi } from "@/services/analyticsApi";
import { Post, Analytics } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreateOrganizationDialog } from "@/components/CreateOrganizationDialog";
import { CreateBrandDialog } from "@/components/CreateBrandDialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { currentBrand } = useBrand();
  const [posts, setPosts] = useState<Post[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentBrand) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [postsRes, analyticsRes] = await Promise.all([
          postApi.getAll(currentBrand._id, { status: 'scheduled', limit: 5 }),
          analyticsApi.get({ brandId: currentBrand._id }),
        ]);

        setPosts(postsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentBrand]);

  // Show setup prompt if no organization or brand
  if (!currentOrganization) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Get Started</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>Create your first organization to start managing your social media.</p>
            <CreateOrganizationDialog />
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentBrand) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Create a Brand</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>Create your first brand under {currentOrganization.name} to get started.</p>
            <CreateBrandDialog />
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back! Here's what's happening with ${currentBrand.name}`}
        actions={
          <Button onClick={() => navigate('/posts/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </>
        ) : (
          <>
            {/* ✅ FIXED: Pass icon component, not JSX element */}
            <StatCard
              title="Total Posts"
              value={analytics?.totalPosts || 0}
              subtitle="All time"
              icon={Calendar}
            />
            <StatCard
              title="Scheduled"
              value={analytics?.scheduledPosts || 0}
              subtitle="Waiting to publish"
              icon={Calendar}
            />
            <StatCard
              title="Published"
              value={analytics?.publishedPosts || 0}
              subtitle="Successfully posted"
              icon={TrendingUp}
            />
            <StatCard
              title="Failed"
              value={analytics?.failedPosts || 0}
              subtitle="Needs attention"
              icon={AlertCircle}
            />
          </>
        )}
      </div>

      {/* Upcoming Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No scheduled posts</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Create your first post to get started
              </p>
              <Button onClick={() => navigate('/posts/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onEdit={(id) => navigate(`/posts/edit/${id}`)}
                  onDelete={(id) => console.log('Delete', id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;