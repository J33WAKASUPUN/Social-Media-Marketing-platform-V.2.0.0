import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

// Status config (same as PostCard)
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  scheduled: { label: "Scheduled", color: "bg-amber-100 text-amber-800", icon: Clock },
  published: { label: "Published", color: "bg-green-100 text-green-800", icon: CheckCircle },
  draft: { label: "Draft", color: "bg-gray-100 text-gray-800", icon: FileText },
  failed: { label: "Failed", color: "bg-red-100 text-red-800", icon: AlertTriangle },
  publishing: { label: "Publishing", color: "bg-blue-100 text-blue-800", icon: Clock },
};

export default function Calendar() {
  const navigate = useNavigate();
  const { currentBrand } = useBrand();
  const permissions = usePermissions();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostForView, setSelectedPostForView] = useState<Post | null>(null); // ✅ ADD THIS LINE

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // ✅ Fetch ALL posts (same as Posts.tsx)
  useEffect(() => {
    if (currentBrand) {
      fetchPosts();
    }
  }, [currentBrand]);

  const fetchPosts = async () => {
    if (!currentBrand) return;

    setLoading(true);
    try {
      // ✅ Fetch ALL posts (no status filter) - same as Posts.tsx
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

  // ✅ Group posts by date (based on schedule's scheduledFor)
  const postsByDate = useMemo(() => {
    const grouped: Record<string, Post[]> = {};

    posts.forEach(post => {
      // Skip drafts without schedules
      if (!post.schedules || post.schedules.length === 0) return;

      post.schedules.forEach(schedule => {
        if (!schedule.scheduledFor) return;

        // ✅ Use LOCAL date for grouping (user's timezone)
        const scheduledDate = new Date(schedule.scheduledFor);
        const dateKey = format(scheduledDate, 'yyyy-MM-dd');

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }

        // Avoid duplicates (same post might have multiple schedules on same day)
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

  // ✅ Get unique platforms for a date
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

  // ✅ Get schedule info for a post
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

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[100px] border bg-muted/30" />);
    }
    
    // Days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const postsForDay = getPostsForDate(date);
      const platforms = getPlatformsForDate(postsForDay);
      const isToday = date === new Date().getDate() && 
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();
      
      // Count by status
      const scheduledCount = postsForDay.filter(p => p.status === 'scheduled').length;
      const publishedCount = postsForDay.filter(p => p.status === 'published').length;
      const failedCount = postsForDay.filter(p => p.status === 'failed').length;
      
      days.push(
        <HoverCard key={date} openDelay={200}>
          <HoverCardTrigger asChild>
            <Card
              className={cn(
                "group min-h-[100px] cursor-pointer p-2 transition-all hover:shadow-lg hover:ring-2 hover:ring-primary",
                isToday && "ring-2 ring-primary bg-primary/5"
              )}
              onClick={() => handleDateClick(date)}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-sm font-semibold",
                  isToday ? "text-primary" : ""
                )}>
                  {date}
                </span>
                {postsForDay.length > 0 && (
                  <Badge variant="outline" className="h-5 px-1.5 text-xs">
                    {postsForDay.length}
                  </Badge>
                )}
              </div>

              {/* ✅ Platform dots */}
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

              {/* ✅ Status indicators */}
              {postsForDay.length > 0 && (
                <div className="mt-2 space-y-1">
                  {scheduledCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <Clock className="h-3 w-3" />
                      <span>{scheduledCount} scheduled</span>
                    </div>
                  )}
                  {publishedCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>{publishedCount} published</span>
                    </div>
                  )}
                  {failedCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{failedCount} failed</span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </HoverCardTrigger>

          {/* ✅ HOVER PREVIEW */}
          {postsForDay.length > 0 && (
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
                          // Viewers see view dialog, others can edit if post is editable
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

                        {/* Media Indicator */}
                        {post.mediaUrls && post.mediaUrls.length > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <div className="flex -space-x-1">
                              {post.mediaUrls.slice(0, 3).map((url, idx) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt=""
                                  className="h-6 w-6 rounded border-2 border-background object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ))}
                            </div>
                            {post.mediaUrls.length > 3 && (
                              <span>+{post.mediaUrls.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="mt-2 flex items-center justify-between">
                          <Badge className={cn("text-xs", statusStyle.color)}>
                            {statusStyle.label}
                          </Badge>
                          {/* Show appropriate text based on permissions */}
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

              {/* Quick Action */}
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

  // ✅ Get posts for selected date (for side sheet)
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
          // ✅ Only show Create Post button if user has permission
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
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

      {/* ✅ Side Sheet for Selected Date Details */}
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
                {/* ✅ Only show Create Post button if user has permission */}
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
                const canEdit = post.status === 'draft' || post.status === 'scheduled';

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
                          <Badge className={cn("text-xs", statusStyle.color)}>
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
                          {post.mediaUrls.slice(0, 4).map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt=""
                              className="h-16 w-16 rounded object-cover border"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/64?text=Media';
                              }}
                            />
                          ))}
                          {post.mediaUrls.length > 4 && (
                            <div className="h-16 w-16 rounded border flex items-center justify-center bg-muted text-xs">
                              +{post.mediaUrls.length - 4}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ✅ Actions - Only for editable posts */}
                      <div className="flex gap-2 pt-2">
                        {/* VIEW BUTTON - VISIBLE TO ALL USERS */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedPostForView(post)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        
                        {/* EDIT BUTTON - Only for users with permission and editable posts */}
                        {canEdit && permissions.canCreatePosts && (
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

                      {/* Show link for published posts */}
                      {post.status === 'published' && post.schedules?.[0]?.platformPostId && (
                        <div className="pt-2 text-xs text-muted-foreground">
                          <span>Published to {scheduleInfo?.displayName}</span>
                        </div>
                      )}

                      {/* Show error for failed posts */}
                      {post.status === 'failed' && post.schedules?.[0]?.error && (
                        <div className="pt-2 text-xs text-red-500">
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

      {/* ✅ ADD VIEW POST DIALOG */}
      <ViewPostDialog
        post={selectedPostForView}
        open={!!selectedPostForView}
        onOpenChange={(open) => !open && setSelectedPostForView(null)}
        onEdit={permissions.canCreatePosts ? (id) => navigate(`/posts/edit/${id}`) : undefined}
        onCancel={permissions.canCreatePosts ? undefined : undefined} // Pass cancel handler if you have one
      />
    </div>
  );
}