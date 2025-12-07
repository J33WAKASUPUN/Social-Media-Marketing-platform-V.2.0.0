import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  FileText, 
  TrendingUp, 
  Download, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Image,
  Video,
  Share2,
  ExternalLink,
  RefreshCw,
  Loader2,
  Trophy,
  FolderOpen,
  HardDrive,
  FileImage,
  FileVideo,
  AlertTriangle,
  Send,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import { PlatformBadge } from "@/components/PlatformBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBrand } from "@/contexts/BrandContext";
import { usePermissions } from "@/hooks/usePermissions"; 
import { analyticsApi, DashboardMetrics, ChannelPerformance } from "@/services/analyticsApi";
import { mediaApi, MediaStats } from "@/services/mediaApi";
import { postApi } from "@/services/postApi";
import { channelApi } from "@/services/channelApi";
import { Post, Channel } from "@/types";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Platform colors
const PLATFORM_COLORS: Record<string, string> = {
  linkedin: '#0077B5',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  instagram: '#E4405F',
  youtube: '#FF0000',
};

// Content type colors
const CONTENT_TYPE_COLORS: Record<string, string> = {
  text: '#6B7280',
  image: '#10B981',
  video: '#1E103FFF',
  carousel: '#F59E0B',
  multiImage: '#3B82F6',
};

// Updated gradient configs - Using main theme purple colors
const TOP_DAY_GRADIENTS = [
  { id: 'rank-1', from: '#B8860B', to: '#C79A28FF', label: 'Best Day' },
  { id: 'rank-2', from: '#71706E', to: '#A5A5A5FF', label: '2nd Place' },
  { id: 'rank-3', from: '#8B4513', to: '#C26F30FF', label: '3rd Place' },
];

// Status config for recent activity - UPDATED FOR DARK MODE
const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  scheduled: { label: "Scheduled", color: "text-amber-700 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30", icon: Clock },
  published: { label: "Published", color: "text-green-700 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30", icon: CheckCircle },
  draft: { label: "Draft", color: "text-gray-700 dark:text-gray-400", bgColor: "bg-gray-100 dark:bg-gray-800", icon: FileText },
  failed: { label: "Failed", color: "text-red-700 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30", icon: AlertTriangle },
  publishing: { label: "Publishing", color: "text-blue-700 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30", icon: Send },
};

// 1TB in bytes for percentage calculation
const MAX_STORAGE_BYTES = 1024 * 1024 * 1024 * 1024; // 1TB

export default function Analytics() {
  const { currentBrand } = useBrand();
  const permissions = usePermissions(); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [channelPerformance, setChannelPerformance] = useState<ChannelPerformance[]>([]);
  const [mediaStats, setMediaStats] = useState<MediaStats | null>(null);
  const [exporting, setExporting] = useState(false);
  
  // Fetch posts and channels directly
  const [posts, setPosts] = useState<Post[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

  // Calculate best posting days from posts (client-side)
  const topPostingDays = useMemo(() => {
    const dayCount: Record<string, number> = {
      'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0,
      'Thursday': 0, 'Friday': 0, 'Saturday': 0
    };
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    posts.forEach(post => {
      if (post.status === 'published' || post.status === 'scheduled') {
        post.schedules?.forEach(schedule => {
          if (schedule.scheduledFor) {
            const date = new Date(schedule.scheduledFor);
            const dayName = dayNames[date.getDay()];
            dayCount[dayName]++;
          }
        });
      }
    });

    const total = Object.values(dayCount).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(dayCount)
      .map(([day, count]) => ({
        day,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [posts]);

  // Get recent activity from posts
  const recentActivity = useMemo(() => {
    return posts
      .filter(post => ['published', 'scheduled', 'failed'].includes(post.status))
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [posts]);

  // Calculate posts per channel
  const postsPerChannel = useMemo(() => {
    const channelCount: Record<string, { count: number; published: number; scheduled: number; failed: number }> = {};
    
    posts.forEach(post => {
      post.schedules?.forEach(schedule => {
        const channelId = schedule.channel?._id || (schedule.channel as any)?.id;
        if (!channelId) return;

        const idStr = String(channelId);
        if (!channelCount[idStr]) {
          channelCount[idStr] = { count: 0, published: 0, scheduled: 0, failed: 0 };
        }

        channelCount[idStr].count++;

        if (schedule.status === 'published') {
          channelCount[idStr].published++;
        } else if (schedule.status === 'pending' || schedule.status === 'queued') {
          channelCount[idStr].scheduled++;
        } else if (schedule.status === 'failed') {
          channelCount[idStr].failed++;
        }
      });
    });

    return channelCount;
  }, [posts]);

  const getChannelStats = (channel: Channel) => {
    const possibleKeys = [
      channel._id,
      (channel as any).id,
      String(channel._id),
      String((channel as any).id),
    ].filter(Boolean);

    for (const key of possibleKeys) {
      if (postsPerChannel[key]) {
        return postsPerChannel[key];
      }
    }
    
    return { count: 0, published: 0, scheduled: 0, failed: 0 };
  };  

  // Calculate platform distribution
  const platformDistribution = useMemo(() => {
    const platformStats: Record<string, { total: number; published: number; scheduled: number; failed: number }> = {};

    posts.forEach(post => {
      post.schedules?.forEach(schedule => {
        const provider = schedule.channel?.provider;
        if (!provider) return;

        if (!platformStats[provider]) {
          platformStats[provider] = { total: 0, published: 0, scheduled: 0, failed: 0 };
        }
        platformStats[provider].total++;

        const scheduleStatus = schedule.status || post.status;
        if (scheduleStatus === 'published') {
          platformStats[provider].published++;
        } else if (scheduleStatus === 'pending' || scheduleStatus === 'queued' || post.status === 'scheduled') {
          platformStats[provider].scheduled++;
        } else if (scheduleStatus === 'failed' || post.status === 'failed') {
          platformStats[provider].failed++;
        }
      });
    });

    const totalPosts = Object.values(platformStats).reduce((sum, s) => sum + s.total, 0);

    return Object.entries(platformStats).map(([provider, stats]) => ({
      provider,
      ...stats,
      percentage: totalPosts > 0 ? ((stats.total / totalPosts) * 100).toFixed(1) : '0',
    }));
  }, [posts]);

  // Fetch all data
  const fetchAnalytics = async (showRefresh = false) => {
    if (!currentBrand) return;

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const postsRes = await postApi.getAll(currentBrand._id);
      setPosts(postsRes.data);

      const channelsRes = await channelApi.getAll(currentBrand._id);
      setChannels(channelsRes.data);

      const [dashboardRes, channelsPerf, mediaRes] = await Promise.all([
        analyticsApi.getDashboard(currentBrand._id, period),
        analyticsApi.getChannelPerformance(currentBrand._id),
        mediaApi.getStats(currentBrand._id),
      ]);

      setDashboardMetrics(dashboardRes.data);
      setChannelPerformance(channelsPerf.data);
      setMediaStats(mediaRes.data);

      if (showRefresh) {
        toast.success('Analytics refreshed');
      }
    } catch (error: any) {
      console.error('Analytics error:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [currentBrand, period]);

  // Export to CSV
  const handleExportCSV = async () => {
    if (!currentBrand) return;

    setExporting(true);
    try {
      const blob = await analyticsApi.exportCSV(currentBrand._id, period);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${currentBrand.name}-${period}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Analytics exported successfully');
    } catch (error) {
      toast.error('Failed to export analytics');
    } finally {
      setExporting(false);
    }
  };

  const storagePercentage = useMemo(() => {
    if (!mediaStats?.totalSize) return 0;
    return (mediaStats.totalSize / MAX_STORAGE_BYTES) * 100;
  }, [mediaStats]);

  const formatStorageUsed = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!currentBrand) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <Card className="p-6 text-center max-w-md">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Brand Selected</h3>
          <p className="text-sm text-muted-foreground">
            Please select a brand to view analytics
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Analytics"
        description={`Performance insights for ${currentBrand.name}`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={exporting || loading}
            >
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Period Selector */}
      <div className="flex flex-wrap gap-2">
        {(['7d', '30d', '90d', 'all'] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p)}
            disabled={loading}
          >
            {p === '7d' && '7 Days'}
            {p === '30d' && '30 Days'}
            {p === '90d' && '90 Days'}
            {p === 'all' && 'All Time'}
          </Button>
        ))}
      </div>

      {loading ? (
        <AnalyticsSkeleton />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            {permissions.canConnectChannels && (
              <TabsTrigger value="channels" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Channels</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            {permissions.canViewMedia && (
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Media</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
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

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Posting Activity
                  </CardTitle>
                  <CardDescription>
                    Posts published over time
                  </CardDescription>
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
                        <BarChart3 className="mx-auto h-12 w-12 mb-2 opacity-50" />
                        <p>No posting data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Platform Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-10 w-5" />
                    Platform Distribution
                  </CardTitle>
                  <CardDescription>
                    Posts by social media platform
                  </CardDescription>
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
                <CardDescription>
                  Your top performing days based on posting activity
                </CardDescription>
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
                <CardDescription>
                  Latest posts across all platforms
                </CardDescription>
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
                                    <Image className="h-3 w-3" />
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
          </TabsContent>

          {/* CHANNELS TAB */}
          {permissions.canConnectChannels && (
            <TabsContent value="channels" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Active Channels"
                  value={channels.filter(c => c.connectionStatus === 'active').length}
                  subtitle="Connected platforms"
                  icon={Share2}
                />
                <StatCard
                  title="Total Channel Posts"
                  value={Object.values(postsPerChannel).reduce((sum, c) => sum + c.count, 0)}
                  subtitle="Across all channels"
                  icon={FileText}
                />
                <StatCard
                  title="Published Posts"
                  value={Object.values(postsPerChannel).reduce((sum, c) => sum + c.published, 0)}
                  subtitle="Successfully posted"
                  icon={CheckCircle}
                />
                <StatCard
                  title="Failed Posts"
                  value={Object.values(postsPerChannel).reduce((sum, c) => sum + c.failed, 0)}
                  subtitle="Needs attention"
                  icon={XCircle}
                />
              </div>

              {/* Channel Performance Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Channel Performance</CardTitle>
                  <CardDescription>
                    Post statistics for each connected channel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {channels.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Channel</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Total Posts</TableHead>
                          <TableHead className="text-right">Published</TableHead>
                          <TableHead className="text-right">Scheduled</TableHead>
                          <TableHead className="text-right">Failed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {channels.map((channel) => {
                          const channelStats = getChannelStats(channel);
                          
                          return (
                            <TableRow key={channel._id || (channel as any).id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={channel.avatar} />
                                    <AvatarFallback>
                                      {channel.displayName?.charAt(0).toUpperCase() || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{channel.displayName}</p>
                                    <p className="text-xs text-muted-foreground capitalize">
                                      {channel.provider}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={channel.connectionStatus === 'active' ? 'default' : 'secondary'}
                                  className={cn(
                                    channel.connectionStatus === 'active' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  )}
                                >
                                  {channel.connectionStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {channelStats.count}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="text-green-600 dark:text-green-400 font-medium">{channelStats.published}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="text-amber-600 dark:text-amber-400 font-medium">{channelStats.scheduled}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                {channelStats.failed > 0 ? (
                                  <span className="text-red-600 dark:text-red-400 font-medium">{channelStats.failed}</span>
                                ) : (
                                  <span className="text-muted-foreground">0</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Share2 className="mx-auto h-12 w-12 mb-2 opacity-50" />
                        <p>No channels connected yet</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Channel Distribution Chart */}
              {channels.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>Posts by Channel</CardTitle>
                        <CardDescription>Performance across all connected channels</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={Math.max(300, channels.filter(ch => getChannelStats(ch).count > 0).length * 60)}>
                      <BarChart 
                        data={channels.map(ch => {
                          const stats = getChannelStats(ch);
                          return {
                            displayName: ch.displayName,
                            provider: ch.provider,
                            totalPosts: stats.count,
                            published: stats.published,
                            scheduled: stats.scheduled,
                            failed: stats.failed,
                            successRate: stats.count > 0 ? ((stats.published / stats.count) * 100).toFixed(1) : 0
                          };
                        }).filter(ch => ch.totalPosts > 0)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                        <XAxis type="number" className="text-xs" />
                        <YAxis 
                          dataKey="displayName" 
                          type="category" 
                          width={140}
                          className="text-xs font-medium"
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="rounded-lg border border-border bg-card p-4 shadow-xl backdrop-blur-sm">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <p className="font-semibold text-sm">{data.displayName}</p>
                                  </div>
                                  <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between gap-8">
                                      <span className="text-muted-foreground">Total Posts:</span>
                                      <span className="font-medium">{data.totalPosts}</span>
                                    </div>
                                    <div className="flex justify-between gap-8">
                                      <span className="text-green-600 dark:text-green-400">Published:</span>
                                      <span className="font-medium text-green-600 dark:text-green-400">{data.published}</span>
                                    </div>
                                    <div className="flex justify-between gap-8">
                                      <span className="text-amber-600 dark:text-amber-400">Scheduled:</span>
                                      <span className="font-medium text-amber-600 dark:text-amber-400">{data.scheduled}</span>
                                    </div>
                                    <div className="flex justify-between gap-8">
                                      <span className="text-red-600 dark:text-red-400">Failed:</span>
                                      <span className="font-medium text-red-600 dark:text-red-400">{data.failed}</span>
                                    </div>
                                    <div className="pt-1.5 mt-1.5 border-t border-border flex justify-between gap-8">
                                      <span className="text-muted-foreground">Success Rate:</span>
                                      <span className="font-semibold text-blue-600 dark:text-blue-400">{data.successRate}%</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                        />
                        <Bar 
                          dataKey="published" 
                          stackId="a" 
                          fill="#22c55e" 
                          name="Published"
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar 
                          dataKey="scheduled" 
                          stackId="a" 
                          fill="#f59e0b" 
                          name="Scheduled"
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar 
                          dataKey="failed" 
                          stackId="a" 
                          fill="#ef4444" 
                          name="Failed"
                          radius={[0, 4, 4, 0]}
                        />
                        <Legend 
                          wrapperStyle={{ paddingLeft: '130px', paddingTop: '20px' }}
                          iconType="circle"
                          align="center"
                          verticalAlign="bottom"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {/* CONTENT TAB */}
          <TabsContent value="content" className="space-y-6">
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
              <Card>
                <CardHeader>
                  <CardTitle>Content Type Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of post types
                  </CardDescription>
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
                  <CardDescription>
                    Tips based on your posting patterns
                  </CardDescription>
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
          </TabsContent>

          {/* MEDIA TAB */}
          {permissions.canViewMedia && (
            <TabsContent value="media" className="space-y-6">
              {/* Media tab content is unchanged as it already supports dark mode via shadcn/ui components */}
              <Card className="overflow-hidden">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" />
                        Media Library Overview
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Storage and file statistics for your media assets
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => fetchAnalytics(true)}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className="text-center p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-transform hover:scale-105">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-white dark:bg-slate-700 shadow-md flex items-center justify-center">
                        <FolderOpen className="h-7 w-7 text-primary" />
                      </div>
                      <div className="text-3xl font-bold text-foreground">
                        {mediaStats?.totalFiles || 0}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        Total Files
                      </div>
                    </div>

                    <div className="text-center p-5 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 transition-transform hover:scale-105">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-white dark:bg-slate-700 shadow-md flex items-center justify-center">
                        <FileImage className="h-7 w-7 text-pink-500" />
                      </div>
                      <div className="text-3xl font-bold text-foreground">
                        {mediaStats?.byType?.find(t => t.type === 'image')?.count || 0}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        Images
                      </div>
                    </div>

                    <div className="text-center p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 transition-transform hover:scale-105">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-white dark:bg-slate-700 shadow-md flex items-center justify-center">
                        <FileVideo className="h-7 w-7 text-blue-500" />
                      </div>
                      <div className="text-3xl font-bold text-foreground">
                        {mediaStats?.byType?.find(t => t.type === 'video')?.count || 0}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        Videos
                      </div>
                    </div>
                  </div>

                  {/* Storage Progress Bar */}
                  <div className="mb-8 p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        Storage Usage
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatStorageUsed(mediaStats?.totalSize || 0)} / 1 TB
                      </span>
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(Math.min(storagePercentage, 100), 0.1)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {storagePercentage.toFixed(4)}% of 1TB used
                    </p>
                  </div>

                  {/* Storage Breakdown Section */}
                  <div className="border-t pt-6">
                    <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Storage Breakdown by Type
                    </h4>
                    
                    <div className="space-y-3">
                      {/* Images */}
                      {(() => {
                        const imageData = mediaStats?.byType?.find(t => t.type === 'image');
                        const imageSize = imageData?.size || 0;
                        const imagePercentageOf1TB = (imageSize / MAX_STORAGE_BYTES) * 100;
                        
                        return (
                          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                                <FileImage className="h-5 w-5 text-pink-500" />
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">Images</div>
                                <div className="text-xs text-muted-foreground">
                                  {imageData?.count || 0} files • {imageData?.sizeFormatted || formatStorageUsed(imageSize)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right min-w-[100px]">
                              <div className="font-semibold text-foreground">
                                {imagePercentageOf1TB.toFixed(3)}%
                              </div>
                              <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                                <div 
                                  className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.max(Math.min(imagePercentageOf1TB * 100, 100), 0.5)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Videos */}
                      {(() => {
                        const videoData = mediaStats?.byType?.find(t => t.type === 'video');
                        const videoSize = videoData?.size || 0;
                        const videoPercentageOf1TB = (videoSize / MAX_STORAGE_BYTES) * 100;
                        
                        return (
                          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                                <FileVideo className="h-5 w-5 text-blue-500" />
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">Videos</div>
                                <div className="text-xs text-muted-foreground">
                                  {videoData?.count || 0} files • {videoData?.sizeFormatted || formatStorageUsed(videoSize)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right min-w-[100px]">
                              <div className="font-semibold text-foreground">
                                {videoPercentageOf1TB.toFixed(3)}%
                              </div>
                              <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.max(Math.min(videoPercentageOf1TB * 100, 100), 0.5)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Empty State */}
                  {(!mediaStats || mediaStats.totalFiles === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <FolderOpen className="mx-auto h-16 w-16 mb-4 opacity-30" />
                      <p className="font-medium">No media files yet</p>
                      <p className="text-sm mt-1">Upload images and videos to see your storage statistics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}       
        </Tabs>
      )}
    </div>
  );
}

// Loading skeleton
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
      <Skeleton className="h-[250px]" />
      <Skeleton className="h-[400px]" />
    </div>
  );
}