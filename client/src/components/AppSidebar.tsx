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
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions"; // ✅ ADD THIS

// ✅ Define menu items with permission requirements
const menuItems = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: LayoutDashboard,
    requiredPermission: null // Everyone can view dashboard
  },
  { 
    title: "Posts", 
    url: "/posts", 
    icon: FileText,
    requiredPermission: 'canViewPosts' // All roles can view posts
  },
  { 
    title: "Calendar", 
    url: "/calendar", 
    icon: Calendar,
    requiredPermission: 'canViewPosts' // All roles can view calendar
  },
  { 
    title: "Analytics", 
    url: "/analytics", 
    icon: BarChart3,
    requiredPermission: 'canViewAnalytics' // All roles can view analytics
  },
  { 
    title: "Channels", 
    url: "/channels", 
    icon: Share2,
    requiredPermission: 'canConnectChannels' // Only owner/manager
  },
  { 
    title: "Media Library", 
    url: "/media", 
    icon: Image,
    requiredPermission: 'canViewMedia' // Owner/Manager/Editor
  },
  { 
    title: "Settings", 
    url: "/settings", 
    icon: Settings,
    requiredPermission: null // Everyone can access settings
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const permissions = usePermissions(); // ✅ ADD THIS
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

  // ✅ Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter(item => {
    // If no permission required, show to everyone
    if (!item.requiredPermission) return true;
    
    // Check if user has the required permission
    return permissions[item.requiredPermission as keyof typeof permissions];
  });

  return (
    <Sidebar collapsible="icon">
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
                  <SidebarMenuItem key={item.title}>
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
                        <TooltipContent side="right">
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
              <TooltipContent side="right">
                <p>{user?.name}</p>
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
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}