import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileText, TrendingUp, Share2, Plus } from "lucide-react";
import { mockAnalytics, mockChannels, mockPosts } from "@/lib/mockData";
import { PlatformBadge } from "@/components/PlatformBadge";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const connectedChannels = mockChannels.filter((c) => c.connected);
  const recentPosts = mockPosts.slice(0, 6);
  const upcomingPosts = mockPosts.filter((p) => p.status === "scheduled").slice(0, 5);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your social media."
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Followers"
          value="12,458"
          change="+12%"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Posts This Week"
          value="24"
          change="+8%"
          changeType="positive"
          icon={FileText}
        />
        <StatCard
          title="Engagement Rate"
          value="4.2%"
          change="+0.3%"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Connected Accounts"
          value={connectedChannels.length}
          subtitle="LinkedIn, Facebook, Twitter, Instagram"
          icon={Share2}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Posting Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockAnalytics.postingTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="posts"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockAnalytics.platformDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockAnalytics.platformDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Upcoming */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post, index) => (
                <div key={post.id} className="flex gap-4">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                      <FileText className="h-5 w-5 text-success" />
                    </div>
                    {index !== recentPosts.length - 1 && (
                      <div className="absolute left-1/2 top-10 h-full w-px -translate-x-1/2 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Post published to {post.platforms[0]}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.publishedDate || post.scheduledDate || "Recently"}
                    </p>
                    <Badge className="mt-1 bg-success text-success-foreground">Published</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Upcoming Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm line-clamp-2">{post.content}</p>
                    <div className="flex flex-wrap gap-1">
                      {post.platforms.map((platform) => (
                        <PlatformBadge key={platform} platform={platform} size="sm" showIcon={false} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{post.scheduledDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAB */}
      <Button
        size="lg"
        variant="gradient"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-elevated"
        onClick={() => navigate("/posts/new")}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
