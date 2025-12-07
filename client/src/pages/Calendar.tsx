import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Plus, Clock, Calendar as CalendarIcon, Loader2, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { PlatformBadge } from "@/components/PlatformBadge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useBrand } from "@/contexts/BrandContext";
import { postApi } from "@/services/postApi";
import { Post } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, isSameMonth, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2 } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { ViewPostDialog } from "@/components/ViewPostDialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Platform colors for dots
const PLATFORM_COLORS: Record<string, string> = {
  linkedin: '#0077B5',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  instagram: '#E4405F',
  youtube: '#FF0000',
};

// Status config with dark mode support
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  scheduled: { 
    label: "Scheduled", 
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", 
    icon: Clock 
  },
  published: { 
    label: "Published", 
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", 
    icon: CheckCircle 
  },
  draft: { 
    label: "Draft", 
    color: "bg-gray-100 text-gray-800 dark:bg-secondary dark:text-secondary-foreground", 
    icon: FileText 
  },
  failed: { 
    label: "Failed", 
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", 
    icon: AlertTriangle 
  },
  publishing: { 
    label: "Publishing", 
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", 
    icon: Clock 
  },
};

export default function Calendar() {
  const navigate = useNavigate();
  const { currentBrand } = useBrand();
  const permissions = usePermissions();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostForView, setSelectedPostForView] = useState<Post | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Fetch ALL posts
  useEffect(() => {
    if (currentBrand) {
      fetchPosts();
    }
  }, [currentBrand]);

  const fetchPosts = async () => {
    if (!currentBrand) return;

    setLoading(true);
    try {
      const response = await postApi.getAll(currentBrand._id);
      console.log('📅 Calendar posts loaded:', response.data.length);
      setPosts(response.data);
    } catch (error: any) {
      toast.error('Failed to load posts');
      console.error('Calendar error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group posts by date
  const postsByDate = useMemo(() => {
    const grouped: Record<string, Post[]> = {};

    posts.forEach(post => {
      if (!post.schedules || post.schedules.length === 0) return;

      post.schedules.forEach(schedule => {
        if (!schedule.scheduledFor) return;

        const scheduledDate = new Date(schedule.scheduledFor);
        const dateKey = format(scheduledDate, 'yyyy-MM-dd');

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }

        if (!grouped[dateKey].find(p => p._id === post._id)) {
          grouped[dateKey].push(post);
        }
      });
    });

    return grouped;
  }, [posts]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const getPostsForDate = (date: number): Post[] => {
    const dateKey = format(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), date),
      'yyyy-MM-dd'
    );
    return postsByDate[dateKey] || [];
  };

  const handleDateClick = (date: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), date));
  };

  const getPlatformsForDate = (posts: Post[]): string[] => {
    const platforms = new Set<string>();
    posts.forEach(post => {
      post.schedules?.forEach(s => {
        if (s.channel?.provider) {
          platforms.add(s.channel.provider);
        }
      });
    });
    return Array.from(platforms);
  };

  const getScheduleInfo = (post: Post) => {
    const schedule = post.schedules?.[0];
    if (!schedule) return null;

    return {
      time: schedule.scheduledFor ? format(new Date(schedule.scheduledFor), 'HH:mm') : '--:--',
      platform: schedule.channel?.provider || 'unknown',
      displayName: schedule.channel?.displayName || 'Unknown',
      status: schedule.status || post.status,
    };
  };

  const CalendarCellSkeleton = () => (
    <Card className="min-h-[100px] p-2 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-6" />
        <Skeleton className="h-5 w-8 rounded-full" />
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-2.5 w-2.5 rounded-full" />
        <Skeleton className="h-2.5 w-2.5 rounded-full" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </Card>
  );

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[100px] border bg-muted/30" />);
    }
    
    // Days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const postsForDay = getPostsForDate(date);
      const platforms = getPlatformsForDate(postsForDay);
      
      const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
      cellDate.setHours(0, 0, 0, 0);
      
      const isToday = date === new Date().getDate() && 
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();
      
      const isPast = cellDate < today;
      const hasNoPosts = postsForDay.length === 0;
      const isLocked = isPast && hasNoPosts;
      
      const scheduledCount = postsForDay.filter(p => p.status === 'scheduled').length;
      const publishedCount = postsForDay.filter(p => p.status === 'published').length;
      const failedCount = postsForDay.filter(p => p.status === 'failed').length;
      
      days.push(
        <HoverCard key={date} openDelay={200}>
          <HoverCardTrigger asChild>
            <Card
              className={cn(
                "group min-h-[100px] p-2 transition-all",
                isToday && "ring-2 ring-primary bg-primary/5",
                isLocked 
                  ? "cursor-not-allowed bg-muted/50 opacity-60" 
                  : "cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-primary"
              )}
              onClick={() => !isLocked && handleDateClick(date)}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-sm font-semibold",
                  isToday ? "text-primary" : "",
                  isLocked && "text-muted-foreground"
                )}>
                  {date}
                </span>
                {postsForDay.length > 0 && (
                  <Badge variant="outline" className="h-5 px-1.5 text-xs">
                    {postsForDay.length}
                  </Badge>
                )}
              </div>

              {/* Platform dots */}
              {platforms.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {platforms.map((platform) => (
                    <div
                      key={platform}
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PLATFORM_COLORS[platform] || '#666' }}
                      title={platform}
                    />
                  ))}
                </div>
              )}

              {/* Status indicators - UPDATED WITH DARK MODE TEXT COLORS */}
              {postsForDay.length > 0 && (
                <div className="mt-2 space-y-1">
                  {scheduledCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <Clock className="h-3 w-3" />
                      <span>{scheduledCount} scheduled</span>
                    </div>
                  )}
                  {publishedCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle className="h-3 w-3" />
                      <span>{publishedCount} published</span>
                    </div>
                  )}
                  {failedCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{failedCount} failed</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </HoverCardTrigger>

          {/* Hover Preview */}
          {postsForDay.length > 0 && !isLocked && (
            <HoverCardContent
              side="right"
              align="start"
              className="w-80 p-0"
            >
              <div className="border-b bg-muted/30 p-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(new Date(currentDate.getFullYear(), currentDate.getMonth(), date), 'MMM dd, yyyy')}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {postsForDay.length} {postsForDay.length === 1 ? 'post' : 'posts'}
                </p>
              </div>

              <ScrollArea className="max-h-[400px]">
                <div className="p-3 space-y-3">
                  {postsForDay.map((post) => {
                    const scheduleInfo = getScheduleInfo(post);
                    const statusStyle = statusConfig[post.status] || statusConfig.draft;

                    return (
                      <Card
                        key={post._id}
                        className="p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (permissions.canCreatePosts && (post.status === 'draft' || post.status === 'scheduled')) {
                            navigate(`/posts/edit/${post._id}`);
                          } else {
                            setSelectedPostForView(post);
                          }
                        }}
                      >
                        {/* Time and Platform */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {scheduleInfo?.time || '--:--'}
                          </div>
                          {scheduleInfo && (
                            <PlatformBadge 
                              platform={scheduleInfo.platform as any} 
                              size="sm"
                            />
                          )}
                        </div>

                        {/* Content Preview */}
                        <p className="text-xs line-clamp-2 text-foreground/80">
                          {post.content || <span className="italic text-muted-foreground">No content</span>}
                        </p>

                        {/* Status Badge */}
                        <div className="mt-2 flex items-center justify-between">
                          <Badge className={cn("text-xs border-0", statusStyle.color)}>
                            {statusStyle.label}
                          </Badge>
                          {(post.status === 'draft' || post.status === 'scheduled') && permissions.canCreatePosts ? (
                            <span className="text-xs text-primary hover:underline">
                              Edit →
                            </span>
                          ) : (
                            <span className="text-xs text-primary hover:underline">
                              View →
                            </span>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDateClick(date);
                  }}
                >
                  View All Posts
                </Button>
              </div>
            </HoverCardContent>
          )}
        </HoverCard>
      );
    }
    
    return days;
  };

  const renderSkeletonCalendar = () => {
    const cells = [];
    const totalCells = 35;
    for (let i = 0; i < totalCells; i++) {
      cells.push(<CalendarCellSkeleton key={i} />);
    }
    return cells;
  };

  const selectedDatePosts = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return postsByDate[dateKey] || [];
  }, [selectedDate, postsByDate]);

  if (!currentBrand) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <Card className="p-6 text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Brand Selected</h3>
          <p className="text-sm text-muted-foreground">
            Please select a brand to view the calendar
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Calendar"
        description="View and manage your scheduled posts"
        actions={
          permissions.canCreatePosts && (
            <Button onClick={() => navigate('/posts/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          )
        }
      />

      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={today}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-muted-foreground">Platforms:</span>
            {Object.entries(PLATFORM_COLORS).map(([platform, color]) => (
              <div key={platform} className="flex items-center gap-1">
                <div 
                  className="h-2.5 w-2.5 rounded-full" 
                  style={{ backgroundColor: color }}
                />
                <span className="capitalize">{platform}</span>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground">
                {day}
              </div>
            ))}
            {renderSkeletonCalendar()}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground">
                {day}
              </div>
            ))}
            {renderCalendarDays()}
          </div>
        )}
      </Card>

      {/* Side Sheet for Selected Date Details */}
      <Sheet open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>
              Posts on {selectedDate?.toLocaleDateString("en-US", { 
                month: "long", 
                day: "numeric", 
                year: "numeric" 
              })}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {selectedDatePosts.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">No posts for this day</p>
                {permissions.canCreatePosts && (
                  <Button
                    className="mt-4"
                    onClick={() => navigate('/posts/new')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Post
                  </Button>
                )}
              </div>
            ) : (
              selectedDatePosts.map((post) => {
                const scheduleInfo = getScheduleInfo(post);
                const statusStyle = statusConfig[post.status] || statusConfig.draft;
                const StatusIcon = statusStyle.icon;

                return (
                  <Card key={post._id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {scheduleInfo?.time || '--:--'}
                          </span>
                          <Badge className={cn("text-xs border-0", statusStyle.color)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusStyle.label}
                          </Badge>
                        </div>
                        {scheduleInfo && (
                          <PlatformBadge platform={scheduleInfo.platform as any} size="sm" />
                        )}
                      </div>

                      {/* Content */}
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {post.content || <span className="italic">No content</span>}
                      </p>

                      {/* Media */}
    {post.mediaUrls && post.mediaUrls.length > 0 && (
      <div className="flex gap-2">
        {post.mediaUrls.slice(0, 4).map((url, idx) => {
          const isVideo = url.match(/\.(mp4|mov|avi|webm)$/i);
          
          return (
            <div key={idx} className="relative h-16 w-16 rounded overflow-hidden border bg-muted">
              {isVideo ? (
                <video
                  src={`${url}#t=0.1`}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/64?text=Media';
                  }}
                />
              )}
            </div>
          );
        })}
        {post.mediaUrls.length > 4 && (
          <div className="h-16 w-16 rounded border flex items-center justify-center bg-muted text-xs">
            +{post.mediaUrls.length - 4}
          </div>
        )}
      </div>
    )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedPostForView(post)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        
                        {(post.status === 'draft' || post.status === 'scheduled') && permissions.canCreatePosts && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/posts/edit/${post._id}`)}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        )}
                      </div>

                      {/* Footer Info - UPDATED TEXT COLOR */}
                      {post.status === 'published' && post.schedules?.[0]?.platformPostId && (
                        <div className="pt-2 text-xs text-muted-foreground">
                          <span>Published to {scheduleInfo?.displayName}</span>
                        </div>
                      )}

                      {post.status === 'failed' && post.schedules?.[0]?.error && (
                        <div className="pt-2 text-xs text-red-500 dark:text-red-400">
                          Error: {post.schedules[0].error}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ViewPostDialog
        post={selectedPostForView}
        open={!!selectedPostForView}
        onOpenChange={(open) => !open && setSelectedPostForView(null)}
        onEdit={permissions.canCreatePosts ? (id) => navigate(`/posts/edit/${id}`) : undefined}
      />
    </div>
  );
}