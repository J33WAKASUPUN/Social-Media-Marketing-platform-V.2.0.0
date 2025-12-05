import {
  LayoutDashboard,
  FileText,
  Calendar,
  Image,
  BarChart3,
  Share2,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { TourTrigger } from '@/components/TourTrigger';

// Define menu items with permission requirements and tour IDs
const menuItems = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: LayoutDashboard,
    requiredPermission: null,
    tourId: "menu-dashboard"
  },
  { 
    title: "Submission History", 
    url: "/posts", 
    icon: FileText,
    requiredPermission: 'canViewPosts',
    tourId: "menu-posts"
  },
  { 
    title: "Calendar", 
    url: "/calendar", 
    icon: Calendar,
    requiredPermission: 'canViewPosts',
    tourId: "menu-calendar"
  },
  { 
    title: "Analytics", 
    url: "/analytics", 
    icon: BarChart3,
    requiredPermission: 'canViewAnalytics',
    tourId: "menu-analytics"
  },
  { 
    title: "Channels", 
    url: "/channels", 
    icon: Share2,
    requiredPermission: 'canConnectChannels',
    tourId: "menu-channels"
  },
  { 
    title: "Media Library", 
    url: "/media", 
    icon: Image,
    requiredPermission: 'canViewMedia',
    tourId: "menu-media"
  },
  { 
    title: "Settings", 
    url: "/settings", 
    icon: Settings,
    requiredPermission: null,
    tourId: "menu-settings"
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const permissions = usePermissions();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Check if a menu item is active
  const isActive = (url: string) => {
    if (url === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(url);
  };

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter(item => {
    if (!item.requiredPermission) return true;
    return permissions[item.requiredPermission as keyof typeof permissions];
  });

  return (
    <TooltipProvider delayDuration={100} skipDelayDuration={0}>
      <Sidebar data-tour="sidebar" collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            {/* Logo */}
            <SidebarGroupLabel className="px-4 py-6">
              <NavLink to="/dashboard" className="flex items-center gap-0">
                <img 
                  src="/logo.png" 
                  alt="SocialFlow" 
                  className="h-10 w-10"
                />
                {!isCollapsed && (
                  <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    SocialFlow
                  </span>
                )}
              </NavLink>
            </SidebarGroupLabel>

            {/* Menu Items */}
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleMenuItems.map((item) => {
                  const active = isActive(item.url);
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.title} data-tour={item.tourId}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            isActive={active}
                            className={cn(
                              "group relative",
                              active && "bg-accent text-accent-foreground"
                            )}
                          >
                            <NavLink to={item.url} className="flex items-center gap-3">
                              <Icon className={cn(
                                "h-5 w-5 transition-colors",
                                active ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                              )} />
                              <span className={cn(
                                "transition-colors",
                                active && "font-medium"
                              )}>
                                {item.title}
                              </span>
                              {active && (
                                <ChevronRight className="ml-auto h-4 w-4 text-primary" />
                              )}
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent 
                            side="right" 
                            sideOffset={10} 
                            collisionPadding={10}
                            className="z-[100] bg-popover text-popover-foreground border shadow-md font-medium"
                          >
                            {item.title}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer with User Info */}
        <SidebarFooter>
          <div className={cn(
            "border-t transition-all duration-200",
            isCollapsed ? "p-2" : "p-4"
          )}>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full"
                    onClick={() => navigate("/settings")}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl || user?.avatar} />
                      <AvatarFallback>
                        {user?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  sideOffset={10} 
                  className="z-[100] bg-popover text-popover-foreground border shadow-md"
                >
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 cursor-pointer" onClick={() => navigate("/settings")}>
                  <AvatarImage src={user?.avatarUrl || user?.avatar} />
                  <AvatarFallback>
                    {user?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="z-[100]">
                    <p>Logout</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}