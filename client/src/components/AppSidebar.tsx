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

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Posts", url: "/posts", icon: FileText },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Channels", url: "/channels", icon: Share2 },
  { title: "Media Library", url: "/media", icon: Image },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
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

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          {/* Logo */}
          <SidebarGroupLabel className="px-4 py-6">
            <div className={cn(
              "flex items-center gap-0 transition-all duration-200",
              isCollapsed ? "justify-center" : ""
            )}>
              <img 
                src="/logo.png" 
                alt="SocialFlow" 
                className="h-8 w-8 flex-shrink-0"
              />
              {!isCollapsed && (
                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  SocialFlow
                </span>
              )}
            </div>
          </SidebarGroupLabel>

          {/* Navigation */}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active = isActive(item.url);
                
                return (
                  <SidebarMenuItem key={item.title}>
                    {isCollapsed ? (
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            className={cn(
                              "transition-all duration-200",
                              active && "bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-600 border-r-2 border-violet-500"
                            )}
                          >
                            <NavLink to={item.url}>
                              <item.icon className={cn(
                                "h-5 w-5 transition-colors",
                                active ? "text-violet-600" : "text-muted-foreground"
                              )} />
                            </NavLink>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        className={cn(
                          "transition-all duration-200",
                          active && "bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-600"
                        )}
                      >
                        <NavLink to={item.url} className="flex items-center gap-3">
                          <item.icon className={cn(
                            "h-5 w-5 transition-colors",
                            active ? "text-violet-600" : "text-muted-foreground"
                          )} />
                          <span className={cn(
                            "font-medium transition-colors",
                            active ? "text-violet-600" : ""
                          )}>
                            {item.title}
                          </span>
                          {active && (
                            <ChevronRight className="ml-auto h-4 w-4 text-violet-500" />
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    )}
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
            // Collapsed state - Just avatar with tooltip
            <div className="flex flex-col items-center gap-2">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={user?.avatarUrl || user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="space-y-1">
                    <p className="font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            // Expanded state - Full user info
            <>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={user?.avatarUrl || user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="mt-3 w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}