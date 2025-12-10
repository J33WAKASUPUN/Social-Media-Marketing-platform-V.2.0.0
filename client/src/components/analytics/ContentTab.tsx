import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Image,
  Video,
  TrendingUp,
  Calendar,
  Activity,
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Post } from '@/types';
import type { DashboardMetrics } from '@/services/analyticsApi';

interface ContentTabProps {
  posts: Post[];
  dashboardMetrics: DashboardMetrics | null;
  topPostingDays: Array<{ day: string; count: number; percentage: string }>;
  CONTENT_TYPE_COLORS: Record<string, string>;
}

export function ContentTab({ posts, dashboardMetrics, topPostingDays, CONTENT_TYPE_COLORS }: ContentTabProps) {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Text Posts"
          value={posts.filter(p => p.mediaType === 'none' || !p.mediaType).length}
          subtitle="Text only posts"
          icon={FileText}
        />
        <StatCard
          title="Image Posts"
          value={posts.filter(p => p.mediaType === 'image').length}
          subtitle="Single image posts"
          icon={Image}
        />
        <StatCard
          title="Video Posts"
          value={posts.filter(p => p.mediaType === 'video').length}
          subtitle="Video content"
          icon={Video}
        />
        <StatCard
          title="Carousels"
          value={posts.filter(p => p.mediaType === 'carousel' || p.mediaType === 'multiImage').length}
          subtitle="Multi-image posts"
          icon={Image}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Content Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Content Type Distribution</CardTitle>
            <CardDescription>Breakdown of post types</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardMetrics?.contentTypeStats && dashboardMetrics.contentTypeStats.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={dashboardMetrics.contentTypeStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="type"
                    >
                      {dashboardMetrics.contentTypeStats.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CONTENT_TYPE_COLORS[entry.type] || '#666'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-lg">
                              <p className="font-medium capitalize">{data.type}</p>
                              <p className="text-sm text-muted-foreground">
                                {data.count} posts ({data.percentage}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="space-y-2 min-w-[150px]">
                  {dashboardMetrics.contentTypeStats.map((type) => (
                    <div key={type.type} className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: CONTENT_TYPE_COLORS[type.type] || '#666' }}
                      />
                      <span className="text-sm capitalize flex-1">{type.type}</span>
                      <span className="text-sm font-medium">{type.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                <p>No content type data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Content Insights</CardTitle>
            <CardDescription>Tips based on your posting patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {posts.length > 0 ? (
                <>
                  <Alert className="border-primary/20 bg-primary/5">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <AlertTitle>Total Posts</AlertTitle>
                    <AlertDescription>
                      You have created <strong>{posts.length}</strong> posts in total.
                    </AlertDescription>
                  </Alert>

                  {topPostingDays[0] && topPostingDays[0].count > 0 && (
                    <Alert className="border-green-500/20 bg-green-500/5">
                      <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertTitle>Best Posting Day</AlertTitle>
                      <AlertDescription>
                        <strong>{topPostingDays[0].day}</strong> is your most active posting day with {topPostingDays[0].percentage}% of posts.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Alert className="border-blue-500/20 bg-blue-500/5">
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle>Success Rate</AlertTitle>
                    <AlertDescription>
                      {posts.filter(p => p.status === 'published').length} of {posts.length} posts have been successfully published ({posts.length > 0 ? ((posts.filter(p => p.status === 'published').length / posts.length) * 100).toFixed(0) : 0}%)
                    </AlertDescription>
                  </Alert>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Start posting to see content insights</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}