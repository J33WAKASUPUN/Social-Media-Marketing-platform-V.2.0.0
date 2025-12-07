import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { usePermissions } from "@/hooks/usePermissions";
import { 
  Plus, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileText,
  Share2,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  Activity,
  Send,
  Image as ImageIcon,
  video,
  Sparkles,
  ChevronRight,
  Play,
  Eye,
  MousePointerClick,
  Flame,
  Coffee,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  CalendarDays,
  TrendingDown,
  MoreHorizontal,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useBrand } from "@/contexts/BrandContext";
import { useAuth } from "@/contexts/AuthContext";
import { postApi } from "@/services/postApi";
import { channelApi } from "@/services/channelApi";
import { mediaApi } from "@/services/mediaApi";
import { Post, Channel } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreateOrganizationDialog } from "@/components/CreateOrganizationDialog";
import { CreateBrandDialog } from "@/components/CreateBrandDialog";
import { PlatformBadge } from "@/components/PlatformBadge";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, startOfDay, endOfDay, addDays, differenceInDays } from "date-fns";

// Platform colors and icons
const PLATFORM_CONFIG: Record<string, { color: string; gradient: string }> = {
  linkedin: { color: '#0077B5', gradient: 'from-[#0077B5] to-[#00A0DC]' },
  facebook: { color: '#1877F2', gradient: 'from-[#1877F2] to-[#42A5F5]' },
  twitter: { color: '#1DA1F2', gradient: 'from-[#1DA1F2] to-[#4FC3F7]' },
  instagram: { color: '#E4405F', gradient: 'from-[#E4405F] via-[#F77737] to-[#FCAF45]' },
  youtube: { color: '#FF0000', gradient: 'from-[#FF0000] to-[#FF5252]' },
};

// Get greeting based on time of day
const getGreeting = (hour: number, userName: string) => {
  const firstName = userName?.split(' ')[0] || 'there';
  
  if (hour >= 0 && hour < 4) {
    return {
      text: `Burning the midnight oil, ${firstName}?`,
      subtext: "Great things happen when the world sleeps. Here's your dashboard.",
      icon: Moon,
      emoji: "🌙",
      gradient: "from-indigo-600 to-purple-600",
    };
  } else if (hour >= 4 && hour < 6) {
    return {
      text: `Early bird, ${firstName}!`,
      subtext: "You're up before the sun. Let's make today count!",
      icon: Sunrise,
      emoji: "🌅",
      gradient: "from-orange-500 to-pink-500",
    };
  } else if (hour >= 6 && hour < 12) {
    return {
      text: `Good morning, ${firstName}!`,
      subtext: "Ready to crush it today? Here's what's happening.",
      icon: Sun,
      emoji: "☀️",
      gradient: "from-amber-500 to-orange-500",
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      text: `Good afternoon, ${firstName}!`,
      subtext: "Keeping the momentum going. Check your progress below.",
      icon: Sun,
      emoji: "🌤️",
      gradient: "from-blue-500 to-cyan-500",
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      text: `Good evening, ${firstName}!`,
      subtext: "Wrapping up the day? Here's your summary.",
      icon: Sunset,
      emoji: "🌆",
      gradient: "from-orange-600 to-red-600",
    };
  } else {
    return {
      text: `Working late, ${firstName}?`,
      subtext: "The hustle never stops. Here's where things stand.",
      icon: Coffee,
      emoji: "🌃",
      gradient: "from-violet-600 to-purple-600",
    };
  }
};

// Animated stat card with glassmorphism
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  gradient: string;
  onClick?: () => void;
  delay?: number;
}

const StatCard = ({ title, value, subtitle, icon: Icon, trend, gradient, onClick, delay = 0 }: StatCardProps) => (
  <Card 
    className={cn(
      "relative overflow-hidden cursor-pointer group",
      "bg-gradient-to-br border-0 shadow-lg",
      "transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]",
      gradient
    )}
    onClick={onClick}
    style={{ animationDelay: `${delay}ms` }}
  >
    {/* Animated background elements */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-700" />
    <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-500" />
    
    <CardContent className="p-6 relative z-10">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-white/80 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-bold text-white tracking-tight">{value}</h3>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                trend.isPositive ? "bg-green-400/20 text-green-100" : "bg-red-400/20 text-red-100"
              )}>
                {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {trend.value}%
              </div>
            )}
          </div>
          {subtitle && <p className="text-xs text-white/60">{subtitle}</p>}
        </div>
        <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors shadow-inner">
          <Icon className="h-7 w-7 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Quick action card
interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
  gradient: string;
  badge?: string;
}

const QuickActionCard = ({ icon: Icon, label, description, onClick, gradient, badge }: QuickActionProps) => (
  <button
    onClick={onClick}
    className="group relative flex items-center gap-4 p-4 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-full text-left overflow-hidden"
  >
    {/* Hover gradient overlay */}
    <div className={cn(
      "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-r",
      gradient
    )} />
    
    <div className={cn(
      "relative p-3 rounded-xl transition-all duration-300 group-hover:scale-110 bg-gradient-to-br shadow-lg",
      gradient
    )}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div className="flex-1 min-w-0 relative">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{label}</p>
        {badge && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{badge}</Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
    </div>
    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
  </button>
);

// Upcoming post card with timeline
interface UpcomingPostCardProps {
  post: Post;
  onClick: () => void;
  isFirst?: boolean;
}

const UpcomingPostCard = ({ post, onClick, isFirst }: UpcomingPostCardProps) => {
  const schedule = post.schedules?.[0];
  const scheduledFor = schedule?.scheduledFor ? new Date(schedule.scheduledFor) : null;
  const platform = schedule?.channel?.provider;
  
  const getTimeLabel = () => {
    if (!scheduledFor) return 'No schedule';
    const now = new Date();
    const diffMs = scheduledFor.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `In ${diffMins} min`;
    if (diffHours < 24) return `In ${diffHours}h`;
    if (isToday(scheduledFor)) return `Today at ${format(scheduledFor, 'HH:mm')}`;
    if (isTomorrow(scheduledFor)) return `Tomorrow at ${format(scheduledFor, 'HH:mm')}`;
    return format(scheduledFor, 'MMM dd, HH:mm');
  };

  const isUrgent = scheduledFor && differenceInDays(scheduledFor, new Date()) === 0;

  const isVideo = post.mediaType === 'video';

  return (
    <div 
      className={cn(
        "group relative flex gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300",
        "hover:bg-accent/50 hover:shadow-md",
        isFirst && "bg-gradient-to-r from-primary/5 to-transparent"
      )}
      onClick={onClick}
    >
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-3 h-3 rounded-full border-2 transition-colors",
          isUrgent ? "bg-amber-500 border-amber-500 animate-pulse" : "bg-primary border-primary"
        )} />
        <div className="w-0.5 flex-1 bg-border mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {platform && (
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: PLATFORM_CONFIG[platform]?.color || '#666' }}
            >
              <span className="text-white text-xs font-bold">
                {platform.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            isUrgent ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"
          )}>
            <Clock className="inline h-3 w-3 mr-1" />
            {getTimeLabel()}
          </span>
        </div>
        
        <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
          {post.content || <span className="italic text-muted-foreground">No content</span>}
        </p>

        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ImageIcon className="h-3 w-3" />
            <span>{post.mediaUrls.length} media</span>
          </div>
        )}
      </div>

      {/* Media preview */}
        {post.mediaUrls?.[0] && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 group-hover:scale-105 transition-transform">
            {isVideo ? (
              <video 
                src={`${post.mediaUrls[0]}#t=0.1`}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <img 
                src={post.mediaUrls[0]} 
                alt="" 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            {post.mediaUrls.length > 1 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs font-bold">+{post.mediaUrls.length - 1}</span>
              </div>
            )}
          </div>
        )}

      <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity self-center" />
    </div>
  );
};

// Recent activity item with better visualization
interface ActivityItemProps {
  post: Post;
  onClick: () => void;
}

const ActivityItem = ({ post, onClick }: ActivityItemProps) => {
  const schedule = post.schedules?.[0];
  const publishedAt = schedule?.publishedAt ? new Date(schedule.publishedAt) : null;
  const platform = schedule?.channel?.provider;
  
  const statusConfig = {
    published: { 
      icon: CheckCircle, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      label: 'Published' 
    },
    failed: { 
      icon: XCircle, 
      color: 'text-red-500', 
      bg: 'bg-red-100 dark:bg-red-900/30',
      label: 'Failed' 
    },
    scheduled: { 
      icon: Clock, 
      color: 'text-amber-500', 
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      label: 'Scheduled' 
    },
    draft: { 
      icon: FileText, 
      color: 'text-gray-500', 
      bg: 'bg-gray-100 dark:bg-gray-900/30',
      label: 'Draft' 
    },
  };

  const config = statusConfig[post.status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = config.icon;

  return (
    <div 
      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className={cn("p-3 rounded-full", config.bg)}>
        <StatusIcon className={cn("h-5 w-5", config.color)} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
            {post.content?.slice(0, 50) || 'No content'}
            {post.content && post.content.length > 50 && '...'}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn("text-xs font-medium", config.color)}>{config.label}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {publishedAt ? formatDistanceToNow(publishedAt, { addSuffix: true }) : 
             post.updatedAt ? formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true }) : 'Recently'}
          </span>
        </div>
      </div>

      {platform && (
        <div 
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: PLATFORM_CONFIG[platform]?.color || '#666' }}
        />
      )}
    </div>
  );
};

// Channel card with better stats
interface ChannelCardProps {
  channel: Channel;
  postCount: number;
}

const ChannelCard = ({ channel, postCount }: ChannelCardProps) => {
  const config = PLATFORM_CONFIG[channel.provider] || { color: '#666', gradient: 'from-gray-500 to-gray-600' };
  
  return (
    <div className="group flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all">
      <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-offset-background" style={{ ringColor: config.color }}>
        <AvatarImage src={channel.avatar} />
        <AvatarFallback 
          className="text-white text-sm font-bold"
          style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}dd)` }}
        >
          {channel.displayName?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{channel.displayName}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground capitalize">{channel.provider}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{postCount} posts</span>
        </div>
      </div>
      <Badge 
        variant="outline" 
        className={cn(
          "text-[10px]",
          channel.connectionStatus === 'active' 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" 
            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400"
        )}
      >
        {channel.connectionStatus === 'active' ? '● Active' : '○ Inactive'}
      </Badge>
    </div>
  );
};

// Platform distribution chart (simple)
interface PlatformDistributionProps {
  platformStats: Array<{ platform: string; count: number }>;
  total: number;
}

const PlatformDistribution = ({ platformStats, total }: PlatformDistributionProps) => (
  <div className="space-y-3">
    {platformStats.map(({ platform, count }) => {
      const percentage = total > 0 ? (count / total) * 100 : 0;
      const config = PLATFORM_CONFIG[platform] || { color: '#666', gradient: 'from-gray-500 to-gray-600' };
      
      return (
        <div key={platform} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-sm font-medium capitalize">{platform}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {count} ({percentage.toFixed(0)}%)
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${percentage}%`,
                background: `linear-gradient(90deg, ${config.color}, ${config.color}aa)`
              }}
            />
          </div>
        </div>
      );
    })}
  </div>
);

// Main Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { currentBrand } = useBrand();
  const { user } = useAuth();
  const permissions = usePermissions();
  const [posts, setPosts] = useState<Post[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mediaStats, setMediaStats] = useState<{ totalFiles: number; totalSize: number } | null>(null);

  // Get current greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return getGreeting(hour, user?.name || 'User');
  }, [user?.name]);

  const GreetingIcon = greeting.icon;

  useEffect(() => {
    const fetchData = async () => {
      if (!currentBrand) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [postsRes, channelsRes, mediaStatsRes] = await Promise.all([
          postApi.getAll(currentBrand._id),
          channelApi.getAll(currentBrand._id),
          mediaApi.getStats(currentBrand._id).catch(() => ({ data: null })),
        ]);

        setPosts(postsRes.data || []);
        setChannels(channelsRes.data || []);
        setMediaStats(mediaStatsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentBrand]);

  const handleRefresh = async () => {
    if (!currentBrand || refreshing) return;
    
    setRefreshing(true);
    try {
      const [postsRes, channelsRes] = await Promise.all([
        postApi.getAll(currentBrand._id),
        channelApi.getAll(currentBrand._id),
      ]);
      setPosts(postsRes.data || []);
      setChannels(channelsRes.data || []);
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Computed stats
  const stats = useMemo(() => {
    const now = new Date();
    const scheduledPosts = posts.filter(p => p.status === 'scheduled');
    const publishedPosts = posts.filter(p => p.status === 'published');
    const failedPosts = posts.filter(p => p.status === 'failed');
    const draftPosts = posts.filter(p => p.status === 'draft');
    const activeChannels = channels.filter(c => c.connectionStatus === 'active');

    // Posts scheduled for today
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const todayScheduled = scheduledPosts.filter(p => {
      const scheduledFor = p.schedules?.[0]?.scheduledFor;
      if (!scheduledFor) return false;
      const date = new Date(scheduledFor);
      return date >= todayStart && date <= todayEnd;
    });

    // Posts for next 7 days
    const next7Days = scheduledPosts.filter(p => {
      const scheduledFor = p.schedules?.[0]?.scheduledFor;
      if (!scheduledFor) return false;
      const date = new Date(scheduledFor);
      return date >= now && date <= addDays(now, 7);
    });

    // Success rate
    const totalCompleted = publishedPosts.length + failedPosts.length;
    const successRate = totalCompleted > 0 
      ? Math.round((publishedPosts.length / totalCompleted) * 100) 
      : 100;

    // Posts this week vs last week (for trend)
    const weekAgo = addDays(now, -7);
    const twoWeeksAgo = addDays(now, -14);
    const thisWeekPosts = posts.filter(p => new Date(p.createdAt) >= weekAgo);
    const lastWeekPosts = posts.filter(p => {
      const date = new Date(p.createdAt);
      return date >= twoWeeksAgo && date < weekAgo;
    });
    const weekTrend = lastWeekPosts.length > 0 
      ? Math.round(((thisWeekPosts.length - lastWeekPosts.length) / lastWeekPosts.length) * 100)
      : 0;

    return {
      total: posts.length,
      scheduled: scheduledPosts.length,
      published: publishedPosts.length,
      failed: failedPosts.length,
      drafts: draftPosts.length,
      activeChannels: activeChannels.length,
      totalChannels: channels.length,
      todayScheduled: todayScheduled.length,
      next7Days: next7Days.length,
      successRate,
      weekTrend,
    };
  }, [posts, channels]);

  // Upcoming posts (sorted by schedule date)
  const upcomingPosts = useMemo(() => {
    return posts
      .filter(p => p.status === 'scheduled' && p.schedules?.[0]?.scheduledFor)
      .sort((a, b) => {
        const dateA = new Date(a.schedules[0].scheduledFor);
        const dateB = new Date(b.schedules[0].scheduledFor);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  }, [posts]);

  // Recent activity (published and failed, sorted by date)
  const recentActivity = useMemo(() => {
    return posts
      .filter(p => p.status === 'published' || p.status === 'failed')
      .sort((a, b) => {
        const dateA = new Date(a.schedules?.[0]?.publishedAt || a.updatedAt || a.createdAt);
        const dateB = new Date(b.schedules?.[0]?.publishedAt || b.updatedAt || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 6);
  }, [posts]);

  // Platform distribution
  const platformStats = useMemo(() => {
    const platformCounts: Record<string, number> = {};
    posts.forEach(post => {
      post.schedules?.forEach(schedule => {
        const provider = schedule.channel?.provider;
        if (provider) {
          platformCounts[provider] = (platformCounts[provider] || 0) + 1;
        }
      });
    });
    return Object.entries(platformCounts)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count);
  }, [posts]);

  // Posts per channel
  const postsPerChannel = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(post => {
      post.schedules?.forEach(schedule => {
        const channelId = schedule.channel?._id;
        if (channelId) {
          counts[channelId] = (counts[channelId] || 0) + 1;
        }
      });
    });
    return counts;
  }, [posts]);

  // Show setup prompt if no organization or brand
  if (!currentOrganization) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <Card className="max-w-md text-center p-8 shadow-2xl">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Welcome to SocialFlow!</h2>
          <p className="text-muted-foreground mb-6">
            Create your first organization to start managing your social media presence like a pro.
          </p>
          <CreateOrganizationDialog />
        </Card>
      </div>
    );
  }

  if (!currentBrand) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <Card className="max-w-md text-center p-8 shadow-2xl">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
            <Target className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Create Your First Brand</h2>
          <p className="text-muted-foreground mb-6">
            Add a brand under <span className="font-medium text-foreground">{currentOrganization.name}</span> to start posting.
          </p>
          <CreateBrandDialog />
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[500px] lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-[500px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header with greeting */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-2xl bg-gradient-to-br shadow-lg",
              greeting.gradient
            )}>
              <GreetingIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                {greeting.text} <span className="text-2xl">{greeting.emoji}</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                {greeting.subtext}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1.5">
              <Target className="h-4 w-4" />
              <span className="font-medium text-foreground">{currentBrand.name}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
          
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
  {permissions.canCreatePosts && (
    <Button onClick={() => navigate('/posts/new')} className="gap-2 shadow-lg">
      <Plus className="h-4 w-4" />
      Create Post
    </Button>
  )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-tour="stats-overview">
        <StatCard
          title="Total Posts"
          value={stats.total}
          subtitle="All time"
          icon={FileText}
          trend={stats.weekTrend !== 0 ? { value: Math.abs(stats.weekTrend), isPositive: stats.weekTrend > 0 } : undefined}
          gradient="from-violet-600 to-purple-600"
          onClick={() => navigate('/posts')}
          delay={0}
        />
        <StatCard
          title="Scheduled"
          value={stats.scheduled}
          subtitle={`${stats.todayScheduled} posting today`}
          icon={Clock}
          gradient="from-amber-500 to-orange-500"
          onClick={() => navigate('/calendar')}
          delay={100}
        />
        <StatCard
          title="Published"
          value={stats.published}
          subtitle={`${stats.successRate}% success rate`}
          icon={CheckCircle}
          trend={stats.successRate >= 80 ? { value: stats.successRate, isPositive: true } : undefined}
          gradient="from-emerald-500 to-green-500"
          onClick={() => navigate('/posts')}
          delay={200}
        />
        <StatCard
          title="Active Channels"
          value={stats.activeChannels}
          subtitle={`${stats.totalChannels} total connected`}
          icon={Share2}
          gradient="from-blue-500 to-cyan-500"
          onClick={() => navigate('/channels')}
          delay={300}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          {permissions.canCreatePosts && (
            <Card className="shadow-md" data-tour="quick-actions">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Zap className="h-5 w-5 text-amber-600" />
                  </div>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <QuickActionCard
                    icon={Plus}
                    label="Create Post"
                    description="Schedule content for your channels"
                    onClick={() => navigate('/posts/new')}
                    gradient="from-violet-500 to-purple-600"
                  />
                  <QuickActionCard
                    icon={Calendar}
                    label="View Calendar"
                    description="See your content schedule"
                    onClick={() => navigate('/calendar')}
                    gradient="from-blue-500 to-cyan-500"
                    badge={stats.next7Days > 0 ? `${stats.next7Days} upcoming` : undefined}
                  />
                  {/* Only show Connect Channel if user has permission */}
                  {permissions.canConnectChannels && (
                    <QuickActionCard
                      icon={Share2}
                      label="Connect Channel"
                      description="Add new social media accounts"
                      onClick={() => navigate('/channels')}
                      gradient="from-emerald-500 to-green-500"
                    />
                  )}
                  {/* Only show View Analytics if user has permission */}
                  {permissions.canViewAnalytics && (
                    <QuickActionCard
                      icon={BarChart3}
                      label="View Analytics"
                      description="Track your performance"
                      onClick={() => navigate('/analytics')}
                      gradient="from-orange-500 to-red-500"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Posts with Timeline */}
          <Card className="shadow-md" data-tour="upcoming-posts">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Upcoming Posts</CardTitle>
                  <CardDescription>
                    {stats.next7Days} posts in the next 7 days
                  </CardDescription>
                </div>
              </div>
              {upcomingPosts.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')} className="gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {upcomingPosts.length > 0 ? (
                <div className="space-y-1">
                  {upcomingPosts.map((post, index) => (
                    <UpcomingPostCard
                      key={post._id}
                      post={post}
                      // ✅ Viewers go to posts list, others can edit
                      onClick={() => permissions.canCreatePosts 
                        ? navigate(`/posts/edit/${post._id}`)
                        : navigate('/posts')
                      }
                      isFirst={index === 0}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-base font-medium">No upcoming posts</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    {permissions.canCreatePosts 
                      ? 'Schedule your first post to see it here'
                      : 'No scheduled posts to display'}
                  </p>
                  {/* ✅ Only show Create Post button if user has permission */}
                  {permissions.canCreatePosts && (
                    <Button size="sm" onClick={() => navigate('/posts/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Post
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Send className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>Latest published posts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <ScrollArea className="h-[320px] pr-4">
                  <div className="space-y-1">
                    {recentActivity.map(post => (
                      <ActivityItem
  key={post._id}
  post={post}
  // Viewers go to posts list, others can edit
  onClick={() => permissions.canCreatePosts 
    ? navigate(`/posts/edit/${post._id}`)
    : navigate('/posts')
  }
/>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <Send className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No recent activity</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Published posts will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connected Channels */}
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Share2 className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Channels</CardTitle>
              </div>
              {/* ✅ Only show Manage button if user can connect channels */}
              {permissions.canConnectChannels && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/channels')}>
                  Manage
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {channels.length > 0 ? (
                <div className="space-y-2">
                  {channels.slice(0, 5).map(channel => (
                    <ChannelCard 
                      key={channel._id} 
                      channel={channel} 
                      postCount={postsPerChannel[channel._id] || 0}
                    />
                  ))}
                  {channels.length > 5 && (
                    <p className="text-xs text-center text-muted-foreground pt-2">
                      +{channels.length - 5} more channels
                    </p>
                  )}
                </div>
) : (
  <div className="flex flex-col items-center justify-center py-6 text-center">
    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
      <Share2 className="h-6 w-6 text-muted-foreground" />
    </div>
    <p className="text-sm font-medium">No channels connected</p>
    <p className="text-xs text-muted-foreground mt-1 mb-3">
      {permissions.canConnectChannels 
        ? 'Connect your social accounts'
        : 'No channels available'}
    </p>
    {/* ✅ Only show Connect Channel button if user has permission */}
    {permissions.canConnectChannels && (
      <Button size="sm" variant="outline" onClick={() => navigate('/channels')}>
        Connect Channel
      </Button>
    )}
  </div>
)}
            </CardContent>
          </Card>

          {/* Media Library Stats */}
<Card className="shadow-md">
  <CardHeader className="pb-4">
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
        <ImageIcon className="h-5 w-5 text-pink-600" />
      </div>
      <CardTitle className="text-lg">Media Library</CardTitle>
    </div>
  </CardHeader>
  <CardContent>
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-3xl font-bold">{mediaStats?.totalFiles || 0}</p>
        <p className="text-xs text-muted-foreground">Total files</p>
      </div>
      {/* ✅ Only show View Library button if user can upload media */}
      {permissions.canUploadMedia && (
        <Button variant="outline" size="sm" onClick={() => navigate('/media')}>
          View Library
        </Button>
      )}
    </div>
    <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
      <ImageIcon className="h-4 w-4 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">
        Upload images and videos to use in your posts
      </p>
    </div>
  </CardContent>
</Card>
        </div>
      </div>

      {/* Failed Posts Alert */}
      {/* {stats.failed > 0 && (
        <Alert variant="destructive" className="shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              You have <strong>{stats.failed}</strong> failed post{stats.failed > 1 ? 's' : ''} that need attention.
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate('/posts')} className="ml-4">
              View Posts
            </Button>
          </AlertDescription>
        </Alert>
      )} */}
    </div>
  );
};

export default Dashboard;