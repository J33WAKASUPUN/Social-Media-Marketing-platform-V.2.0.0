import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNotification } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Share2,
  Clock,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  Filter,
  Inbox,
} from 'lucide-react';
import type { Notification, NotificationType } from '@/types';

// Notification type icons
const notificationIcons: Record<NotificationType, React.ElementType> = {
  post_published: CheckCircle,
  post_failed: XCircle,
  post_scheduled: Clock,
  channel_disconnected: AlertTriangle,
  channel_connected: Share2,
  member_invited: Info,
  member_joined: Info,
  approval_required: Info,
  approval_granted: CheckCircle,
  approval_rejected: XCircle,
  media_uploaded: Info,
  system: Info,
};

const notificationColors: Record<NotificationType, string> = {
  post_published: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  post_failed: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  post_scheduled: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  channel_disconnected: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  channel_connected: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  member_invited: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  member_joined: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  approval_required: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  approval_granted: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  approval_rejected: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  media_uploaded: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  system: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
};

const priorityColors = {
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
} as const;

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotification();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
    return true;
  });

  // Group by read/unread
  const unreadNotifications = filteredNotifications.filter((n) => !n.read);
  const readNotifications = filteredNotifications.filter((n) => n.read);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.data?.postId) {
      navigate(`/posts/edit/${notification.data.postId}`);
    } else if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const IconComponent = notificationIcons[notification.type] || Info;
    const colorClass = notificationColors[notification.type] || notificationColors.system;

    return (
      <Card
        className={cn(
          'mb-3 cursor-pointer transition-all hover:shadow-md',
          !notification.read && 'border-l-4 border-l-primary bg-muted/30'
        )}
        onClick={() => handleNotificationClick(notification)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={cn('p-3 rounded-full shrink-0', colorClass)}>
              <IconComponent className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{notification.title}</h3>
                    {!notification.read && (
                      <Badge variant="default" className="text-xs h-5">
                        New
                      </Badge>
                    )}
                    {notification.priority === 'high' && (
                      <Badge variant={priorityColors[notification.priority]} className="text-xs h-5">
                        High Priority
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification._id);
                      }}
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => handleDelete(notification._id, e)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </span>
                {notification.brand && (
                  <Badge variant="outline" className="text-xs">
                    {notification.brand.name}
                  </Badge>
                )}
              </div>

              {/* Action Button */}
              {notification.actionUrl && notification.actionText && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNotificationClick(notification);
                  }}
                >
                  {notification.actionText}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No notifications</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="post_published">Published Posts</SelectItem>
            <SelectItem value="post_failed">Failed Posts</SelectItem>
            <SelectItem value="post_scheduled">Scheduled Posts</SelectItem>
            <SelectItem value="channel_connected">Channel Connected</SelectItem>
            <SelectItem value="channel_disconnected">Channel Disconnected</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            Read ({notifications.length - unreadCount})
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="space-y-3 mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <TabsContent value="all" className="mt-6">
              {filteredNotifications.length === 0 ? (
                <EmptyState message="You have no notifications yet. They'll appear here when you get them." />
              ) : (
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {filteredNotifications.map((notification) => (
                    <NotificationCard key={notification._id} notification={notification} />
                  ))}
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="unread" className="mt-6">
              {unreadNotifications.length === 0 ? (
                <EmptyState message="You're all caught up! No unread notifications." />
              ) : (
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {unreadNotifications.map((notification) => (
                    <NotificationCard key={notification._id} notification={notification} />
                  ))}
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="read" className="mt-6">
              {readNotifications.length === 0 ? (
                <EmptyState message="No read notifications yet." />
              ) : (
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {readNotifications.map((notification) => (
                    <NotificationCard key={notification._id} notification={notification} />
                  ))}
                </ScrollArea>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}