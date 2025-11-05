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
  const { currentOrganization, organizations, loading: orgLoading } = useOrganization();
  const { currentBrand, brands, loading: brandLoading } = useBrand();
  
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentBrand) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch recent posts
        const postsResponse = await postApi.getAll({
          brandId: currentBrand._id,
          limit: 5,
        });
        setRecentPosts(postsResponse.data);

        // Fetch analytics
        const analyticsResponse = await analyticsApi.get({
          brandId: currentBrand._id,
        });
        setAnalytics(analyticsResponse.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentBrand]);

  // Show loading state while organizations are loading
  if (orgLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // Show message if no organizations
  if (organizations.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Organizations Found</AlertTitle>
          <AlertDescription className="mt-2">
            You need to create an organization first to get started.
          </AlertDescription>
          <div className="mt-4">
            <CreateOrganizationDialog />
          </div>
        </Alert>
      </div>
    );
  }

  // Show message if no brands
  if (brands.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Brands Found</AlertTitle>
          <AlertDescription className="mt-2">
            Create your first brand to start managing social media posts.
          </AlertDescription>
          <div className="mt-4">
            <CreateBrandDialog />
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back! Here's what's happening with ${currentBrand?.name || 'your brand'}.`}
      >
        <Button onClick={() => navigate("/posts/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Button>
      </PageHeader>

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
            <StatCard
              title="Total Posts"
              value={analytics?.totalPosts || 0}
              description="All time"
              icon={<Calendar className="h-4 w-4" />}
            />
            <StatCard
              title="Scheduled"
              value={analytics?.scheduledPosts || 0}
              description="Waiting to publish"
              icon={<Calendar className="h-4 w-4" />}
              trend={{ value: 0, isPositive: true }}
            />
            <StatCard
              title="Published"
              value={analytics?.publishedPosts || 0}
              description="Successfully posted"
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <StatCard
              title="Total Engagement"
              value={analytics?.totalEngagement || 0}
              description="Likes, comments, shares"
              icon={<Users className="h-4 w-4" />}
              trend={{ value: 0, isPositive: true }}
            />
          </>
        )}
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : recentPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No posts yet</p>
              <Button onClick={() => navigate("/posts/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Post
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;