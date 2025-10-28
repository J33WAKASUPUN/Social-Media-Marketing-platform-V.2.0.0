import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockUser, mockNotifications } from "@/lib/mockData";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Info } from "lucide-react";

const notificationIcons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export const AppHeader = () => {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger />
      
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search posts, media..."
            className="pl-10"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-destructive p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between border-b p-4">
                <h3 className="font-semibold">Notifications</h3>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary">
                  Mark all as read
                </Button>
              </div>
              <ScrollArea className="h-[400px]">
                {mockNotifications.map((notification) => {
                  const Icon = notificationIcons[notification.type as keyof typeof notificationIcons];
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "border-b p-4 transition-colors hover:bg-muted/50",
                        !notification.read && "bg-primary/5"
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          "rounded-full p-2",
                          notification.type === "success" && "bg-success/10",
                          notification.type === "error" && "bg-destructive/10",
                          notification.type === "info" && "bg-primary/10"
                        )}>
                          <Icon className={cn(
                            "h-4 w-4",
                            notification.type === "success" && "text-success",
                            notification.type === "error" && "text-destructive",
                            notification.type === "info" && "text-primary"
                          )} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>
              <div className="border-t p-2">
                <Button variant="ghost" className="w-full text-xs text-primary">
                  View all notifications
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {mockUser.initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{mockUser.name}</p>
                  <p className="text-xs text-muted-foreground">{mockUser.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
