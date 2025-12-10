import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlatformBadge } from '@/components/PlatformBadge';
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
  PieChart,
  Trophy,
  Calendar,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Post } from '@/types';
import type { DashboardMetrics } from '@/services/analyticsApi';

interface OverviewTabProps {
  posts: Post[];
  dashboardMetrics: DashboardMetrics | null;
  period: string;
  platformDistribution: Array<{
    provider: string;
    total: number;
    published: number;
    scheduled: number;
    failed: number;
    percentage: string;
  }>;
  topPostingDays: Array<{
    day: string;
    count: number;
    percentage: string;
  }>;
  recentActivity: Post[];
  statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }>;
  PLATFORM_COLORS: Record<string, string>;
  TOP_DAY_GRADIENTS: Array<{ id: string; from: string; to: string; label: string }>;
}

export function OverviewTab({
  posts,
  dashboardMetrics,
  period,
  platformDistribution,
  topPostingDays,
  recentActivity,
  statusConfig,
  PLATFORM_COLORS,
  TOP_DAY_GRADIENTS,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Posts"
          value={posts.length}
          subtitle={`${period === 'all' ? 'All time' : `Last ${period.replace('d', ' days')}`}`}
          icon={FileText}
        />
        <StatCard
          title="Published"
          value={posts.filter(p => p.status === 'published').length}
          subtitle="Successfully posted"
          icon={CheckCircle}
        />
        <StatCard
          title="Scheduled"
          value={posts.filter(p => p.status === 'scheduled').length}
          subtitle="Waiting to publish"
          icon={Clock}
        />
        <StatCard
          title="Failed"
          value={posts.filter(p => p.status === 'failed').length}
          subtitle="Needs attention"
          icon={XCircle}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Posting Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Posting Activity
            </CardTitle>
            <CardDescription>Posts published over time</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardMetrics?.postingTrends && dashboardMetrics.postingTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardMetrics.postingTrends}>
                  <defs>
                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A273D1FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#A273D1FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <p className="font-medium">{format(new Date(label), 'MMM d, yyyy')}</p>
                            <p className="text-sm text-muted-foreground">
                              {payload[0].value} posts
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#A273D1FF"
                    strokeWidth={2}
                    fill="url(#colorPosts)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No posting data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-10 w-5" />
              Platform Distribution
            </CardTitle>
            <CardDescription>Posts by social media platform</CardDescription>
          </CardHeader>
          <CardContent>
            {platformDistribution.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPieChart>
                    <Pie
                      data={platformDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="total"
                      nameKey="provider"
                    >
                      {platformDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={PLATFORM_COLORS[entry.provider] || '#666'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-lg">
                              <p className="font-medium capitalize">{data.provider}</p>
                              <p className="text-sm">Total: {data.total} ({data.percentage}%)</p>
                              <div className="mt-1 space-y-0.5 text-xs">
                                <p className="text-green-600 dark:text-green-400">Published: {data.published}</p>
                                <p className="text-amber-600 dark:text-amber-400">Scheduled: {data.scheduled}</p>
                                <p className="text-red-600 dark:text-red-400">Failed: {data.failed}</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="space-y-3 min-w-[180px]">
                  {platformDistribution.map((platform) => (
                    <div key={platform.provider} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: PLATFORM_COLORS[platform.provider] || '#666' }}
                        />
                        <span className="text-sm capitalize flex-1">{platform.provider}</span>
                        <span className="text-sm font-medium">{platform.total}</span>
                      </div>
                      <div className="flex gap-2 text-xs text-muted-foreground pl-5">
                        <span className="text-green-600 dark:text-green-400">{platform.published} pub</span>
                        <span className="text-amber-600 dark:text-amber-400">{platform.scheduled} sch</span>
                        {platform.failed > 0 && (
                          <span className="text-red-600 dark:text-red-400">{platform.failed} fail</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PieChart className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No platform data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Posting Days */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-foreground" />
            Best Posting Days
          </CardTitle>
          <CardDescription>Your top performing days based on posting activity</CardDescription>
        </CardHeader>
        <CardContent>
          {topPostingDays.length > 0 && topPostingDays.some(d => d.count > 0) ? (
            <div className="grid gap-4 md:grid-cols-3">
              {topPostingDays.map((day, index) => {
                const gradient = TOP_DAY_GRADIENTS[index];
                const sparklineData = [
                  Math.floor(day.count * 0.4),
                  Math.floor(day.count * 0.6),
                  Math.floor(day.count * 0.8),
                  day.count,
                ];
                const maxSparkline = Math.max(...sparklineData, 1);

                return (
                  <div
                    key={day.day}
                    className="relative overflow-hidden rounded-xl p-6 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
                    }}
                  >
                    <div 
                      className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
                      style={{ backgroundColor: 'white' }}
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-4 w-4 text-white opacity-80" />
                      <span className="text-xs font-medium opacity-90">{gradient.label}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{day.day}</h3>
                    <div className="text-4xl font-bold mb-1">{day.count}</div>
                    <div className="text-sm opacity-90 mb-4">
                      posts ({day.percentage}%)
                    </div>
                    <div className="flex items-end gap-1 h-8 mt-2">
                      {sparklineData.map((value, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm transition-all duration-300 hover:opacity-80"
                          style={{
                            height: `${(value / maxSparkline) * 100}%`,
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            minHeight: '4px',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Calendar className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No posting day data available</p>
                <p className="text-xs mt-1">Start publishing to see your best days</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest posts across all platforms</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {recentActivity.length > 0 ? (
              <div className="divide-y">
                {recentActivity.map((post) => {
                  const status = statusConfig[post.status] || statusConfig.draft;
                  const StatusIcon = status.icon;
                  const schedule = post.schedules?.[0];
                  const platform = schedule?.channel?.provider;
                  const displayDate = post.status === 'published' && schedule?.publishedAt
                    ? schedule.publishedAt
                    : schedule?.scheduledFor || post.updatedAt || post.createdAt;

                  return (
                    <div 
                      key={post._id} 
                      className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        status.bgColor
                      )}>
                        <StatusIcon className={cn("h-5 w-5", status.color)} />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs font-medium border-0", status.color, status.bgColor)}
                          >
                            {status.label}
                          </Badge>
                          {platform && (
                            <PlatformBadge platform={platform as any} size="sm" />
                          )}
                        </div>
                        <p className="text-sm line-clamp-2 text-foreground">
                          {post.content || <span className="italic text-muted-foreground">No content</span>}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(displayDate), { addSuffix: true })}
                          </span>
                          {post.mediaUrls && post.mediaUrls.length > 0 && (
                            <span className="flex items-center gap-1">
                              <ImageIcon className="h-3 w-3" />
                              {post.mediaUrls.length} media
                            </span>
                          )}
                        </div>
                      </div>

                      {post.mediaUrls && post.mediaUrls.length > 0 && (
                        <div className="hidden sm:block shrink-0">
                          <img
                            src={post.mediaUrls[0]}
                            alt=""
                            className="h-14 w-14 rounded-lg object-cover border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {post.status === 'published' && schedule?.platformPostId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => {
                            let url = '';
                            switch (platform) {
                              case 'linkedin':
                                url = `https://www.linkedin.com/feed/update/${schedule.platformPostId}`;
                                break;
                              case 'facebook':
                                url = `https://www.facebook.com/${schedule.platformPostId}`;
                                break;
                              case 'twitter':
                                url = `https://twitter.com/i/status/${schedule.platformPostId}`;
                                break;
                              case 'instagram':
                                url = `https://www.instagram.com/p/${schedule.platformPostId}`;
                                break;
                              case 'youtube':
                                url = `https://www.youtube.com/watch?v=${schedule.platformPostId}`;
                                break;
                            }
                            if (url) window.open(url, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-xs mt-1">Create your first post to get started</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}