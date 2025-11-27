import { Bell, Search, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import { OrganizationSelector } from "./OrganizationSelector";
import { BrandSelector } from "./BrandSelector";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Send,
  Share2,
  Clock,
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
  post_published: 'text-green-500 bg-green-100',
  post_failed: 'text-red-500 bg-red-100',
  post_scheduled: 'text-blue-500 bg-blue-100',
  channel_disconnected: 'text-amber-500 bg-amber-100',
  channel_connected: 'text-green-500 bg-green-100',
  system: 'text-gray-500 bg-gray-100',
};

export function AppHeader() {
  const { user } = useAuth();
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
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Left side: Trigger */}
        <SidebarTrigger />
        
        {/* Separator */}
        <div className="h-6 w-px bg-border" />

        {/* Left Side: Selectors */}
        <div className="flex items-center gap-2">
          <OrganizationSelector />
          <BrandSelector />
        </div>

        {/* Spacer - pushes everything below to the right */}
        <div className="flex-1" />

        {/* Right Side: Search (Hidden/Placeholder) */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            {/* Search Input Placeholder */}
          </div>
        </div>

        {/* Right Side: Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          {/* Changed align to "end" so it anchors to the right */}
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-3 border-b">
              <h4 className="font-semibold text-sm">Notifications</h4>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => markAllAsRead()}
                >
                  Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.slice(0, 10).map((notification) => {
                    const Icon = notificationIcons[notification.type] || Info;
                    const colorClass = notificationColors[notification.type] || notificationColors.system;
                    
                    return (
                      <div
                        key={notification._id}
                        className={cn(
                          "flex gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors",
                          !notification.read && "bg-accent/30"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className={cn("p-2 rounded-full flex-shrink-0", colorClass)}>
                          <Icon className="h-6 w-6" /> {/* Adjusted icon size */}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm line-clamp-2",
                            !notification.read && "font-medium"
                          )}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}