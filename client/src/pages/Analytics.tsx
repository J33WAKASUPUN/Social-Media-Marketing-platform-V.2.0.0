import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Download, 
  BarChart3,
  Share2,
  Image,
  RefreshCw,
  MessageCircle,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  Loader2
} from "lucide-react";
import { useBrand } from "@/contexts/BrandContext";
import { usePermissions } from "@/hooks/usePermissions"; 
import { analyticsApi, DashboardMetrics } from "@/services/analyticsApi";
import { mediaApi, MediaStats } from "@/services/mediaApi";
import { postApi } from "@/services/postApi";
import { channelApi } from "@/services/channelApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ✅ Import your extracted Tab components
import { OverviewTab } from "@/components/analytics/OverviewTab";
import { ChannelsTab } from "@/components/analytics/ChannelsTab";
import { ContentTab } from "@/components/analytics/ContentTab";
import { MediaTab } from "@/components/analytics/MediaTab";
import { WhatsAppAnalyticsSection } from "@/components/analytics/WhatsAppAnalyticsSection";

import type { Post, Channel } from "@/types";

// --- CONSTANTS ---

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: '#0077B5',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  instagram: '#E4405F',
  youtube: '#FF0000',
};

const CONTENT_TYPE_COLORS: Record<string, string> = {
  text: '#6B7280',
  image: '#10B981',
  video: '#1E103FFF',
  carousel: '#F59E0B',
  multiImage: '#3B82F6',
};

const TOP_DAY_GRADIENTS = [
  { id: 'rank-1', from: '#B8860B', to: '#C79A28FF', label: 'Best Day' },
  { id: 'rank-2', from: '#71706E', to: '#A5A5A5FF', label: '2nd Place' },
  { id: 'rank-3', from: '#8B4513', to: '#C26F30FF', label: '3rd Place' },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  scheduled: { label: "Scheduled", color: "text-amber-700 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30", icon: Clock },
  published: { label: "Published", color: "text-green-700 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30", icon: CheckCircle },
  draft: { label: "Draft", color: "text-gray-700 dark:text-gray-400", bgColor: "bg-gray-100 dark:bg-gray-800", icon: FileText },
  failed: { label: "Failed", color: "text-red-700 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30", icon: AlertTriangle },
  publishing: { label: "Publishing", color: "text-blue-700 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30", icon: Send },
};

const MAX_STORAGE_BYTES = 1024 * 1024 * 1024 * 1024; // 1TB

export default function Analytics() {
  const { currentBrand } = useBrand();
  const permissions = usePermissions(); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [mediaStats, setMediaStats] = useState<MediaStats | null>(null);
  const [exporting, setExporting] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

  // --- CALCULATIONS ---

  // 1. Filter out WhatsApp from standard Channels view
  const socialChannels = useMemo(() => {
    return channels.filter(c => c.provider !== 'whatsapp');
  }, [channels]);

  // 2. Check if WhatsApp is connected and user has access
  const hasWhatsAppAccess = useMemo(() => {
    // ✅ Only managers and owners can access WhatsApp analytics
    const hasRole = permissions.isManager || permissions.isOwner;
    const hasWhatsAppChannel = channels.some(c => c.provider === 'whatsapp');
    return hasRole && hasWhatsAppChannel;
  }, [permissions, channels]);

  // 3. Calculate Best Posting Days
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

  // 4. Recent Activity List
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

  // 5. Posts Per Channel (Social Only)
  const postsPerChannel = useMemo(() => {
    const channelCount: Record<string, { count: number; published: number; scheduled: number; failed: number }> = {};
    
    posts.forEach(post => {
      post.schedules?.forEach(schedule => {
        const channelId = schedule.channel?._id || (schedule.channel as any)?.id;
        const provider = schedule.channel?.provider;
        
        // Skip WhatsApp in social stats
        if (!channelId || provider === 'whatsapp') return;

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

  // 6. Platform Distribution (Social Only)
  const platformDistribution = useMemo(() => {
    const platformStats: Record<string, { total: number; published: number; scheduled: number; failed: number }> = {};

    posts.forEach(post => {
      post.schedules?.forEach(schedule => {
        const provider = schedule.channel?.provider;
        if (!provider || provider === 'whatsapp') return; // Skip WhatsApp

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

  // 7. Storage Calculations
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

  // --- API CALLS ---

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

      const [dashboardRes, mediaRes] = await Promise.all([
        analyticsApi.getDashboard(currentBrand._id, period),
        mediaApi.getStats(currentBrand._id),
      ]);

      setDashboardMetrics(dashboardRes.data);
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

  // --- RENDER ---

  if (!currentBrand) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Brand Selected</h3>
          <p className="text-sm text-muted-foreground">Please select a brand to view analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Analytics"
        description={`Performance insights for ${currentBrand.name}`}
        actions={
          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
              {(['7d', '30d', '90d', 'all'] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className={cn("text-xs font-medium h-7 px-3", period === p && "shadow-sm")}
                >
                  {p === 'all' ? 'All' : p}
                </Button>
              ))}
            </div>

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
              Export
            </Button>
          </div>
        }
      />

      {loading ? (
        <AnalyticsSkeleton />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* ✅ UPDATED TAB LIST: WhatsApp restricted to Manager/Owner only */}
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="gap-2 py-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            
            {permissions.canConnectChannels && (
              <TabsTrigger value="channels" className="gap-2 py-2">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Channels</span>
              </TabsTrigger>
            )}

            {/* ✅ WhatsApp Tab - Only show for Manager/Owner with WhatsApp connected */}
            {hasWhatsAppAccess && (
              <TabsTrigger value="whatsapp" className="gap-2 py-2 data-[state=active]:text-[#25D366]">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </TabsTrigger>
            )}

            <TabsTrigger value="content" className="gap-2 py-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            
            {permissions.canViewMedia && (
              <TabsTrigger value="media" className="gap-2 py-2">
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Media</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* 1. Overview Tab */}
          <TabsContent value="overview" className="space-y-6 animate-in fade-in-50">
            <OverviewTab
              posts={posts}
              dashboardMetrics={dashboardMetrics}
              period={period}
              platformDistribution={platformDistribution}
              topPostingDays={topPostingDays}
              recentActivity={recentActivity}
              statusConfig={statusConfig}
              PLATFORM_COLORS={PLATFORM_COLORS}
              TOP_DAY_GRADIENTS={TOP_DAY_GRADIENTS}
            />
          </TabsContent>

          {/* 2. Channels Tab */}
          <TabsContent value="channels" className="space-y-6 animate-in fade-in-50">
            <ChannelsTab
              channels={socialChannels} // ✅ Using filtered social channels (No WhatsApp)
              postsPerChannel={postsPerChannel}
              getChannelStats={getChannelStats}
            />
          </TabsContent>

          {/* 3. WhatsApp Tab - Only rendered if user has access */}
          {hasWhatsAppAccess && (
            <TabsContent value="whatsapp" className="space-y-6 animate-in fade-in-50">
              <WhatsAppAnalyticsSection brandId={currentBrand._id} />
            </TabsContent>
          )}

          {/* 4. Content Tab */}
          <TabsContent value="content" className="space-y-6 animate-in fade-in-50">
            <ContentTab
              posts={posts}
              dashboardMetrics={dashboardMetrics}
              topPostingDays={topPostingDays}
              CONTENT_TYPE_COLORS={CONTENT_TYPE_COLORS}
            />
          </TabsContent>

          {/* 5. Media Tab */}
          <TabsContent value="media" className="space-y-6 animate-in fade-in-50">
            <MediaTab
              mediaStats={mediaStats}
              storagePercentage={storagePercentage}
              formatStorageUsed={formatStorageUsed}
              onRefresh={() => fetchAnalytics(true)}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// Skeleton Loader
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    </div>
  );
}