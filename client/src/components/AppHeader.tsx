import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useNavigate } from "react-router-dom";
import { OrganizationSelector } from "./OrganizationSelector";
import { BrandSelector } from "./BrandSelector";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Share2,
  Clock,
  Settings,
  LogOut,
} from "lucide-react";

// Notification type icons
const notificationIcons: Record<string, React.ElementType> = {
  post_published: CheckCircle,
  post_failed: XCircle,
  post_scheduled: Clock,
  channel_disconnected: AlertTriangle,
  channel_connected: Share2,
  system: Info,
};

const notificationColors: Record<string, string> = {
  post_published: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  post_failed: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  post_scheduled: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  channel_disconnected: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
  channel_connected: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  system: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
};

export function AppHeader() {
  const { user } = useAuth();
  const permissions = usePermissions(); // Use the usePermissions hook instead
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: any) => {
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left side - Sidebar Trigger, Organization & Brand Selector */}
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div data-tour="organization-selector">
            <OrganizationSelector />
          </div>
          <div data-tour="brand-selector">
            <BrandSelector />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative border" data-tour="notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <span className="font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto py-1"
                    onClick={() => markAllAsRead()}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => {
                    const IconComponent = notificationIcons[notification.type] || Info;
                    const colorClass = notificationColors[notification.type] || notificationColors.system;

                    return (
                      <DropdownMenuItem
                        key={notification._id}
                        className={cn(
                          "flex items-start gap-3 p-3 cursor-pointer",
                          !notification.read && "bg-muted/50"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className={cn("p-2 rounded-full shrink-0", colorClass)}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </DropdownMenuItem>
                    );
                  })
                )}
              </ScrollArea>
              {notifications.length > 0 && (
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => navigate('/notifications')}
                  >
                    View all notifications
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}