import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  MessageSquare,
  Settings,
  Users,
  Zap,
  PenTool,
  Globe,
  Bell,
  ChevronDown,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  {
    title: 'Overview',
    url: '/dashboard',
    icon: Home,
    exact: true,
  },
  {
    title: 'Create Post',
    url: '/dashboard/compose',
    icon: PenTool,
  },
  {
    title: 'Content Library',
    url: '/dashboard/content',
    icon: FileText,
  },
  {
    title: 'Calendar',
    url: '/dashboard/calendar',
    icon: Calendar,
  },
  {
    title: 'Analytics',
    url: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'Social Accounts',
    url: '/dashboard/accounts',
    icon: Globe,
  },
];

const teamNavigation = [
  {
    title: 'Team Members',
    url: '/dashboard/team',
    icon: Users,
  },
  {
    title: 'Notifications',
    url: '/dashboard/notifications',
    icon: Bell,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getNavClass = (path: string, exact?: boolean) => {
    return isActive(path, exact) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50";
  };

  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-xl">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <h1 className="text-lg font-semibold gradient-text">SocialHub Pro</h1>
              <p className="text-xs text-sidebar-foreground/70">{user?.organization}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className={getNavClass(item.url, item.exact)}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Team & Collaboration */}
        <SidebarGroup>
          <SidebarGroupLabel>Team & Collaboration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {teamNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className={getNavClass(item.url)}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/settings" className={getNavClass('/dashboard/settings')}>
                    <Settings className="w-4 h-4" />
                    {!isCollapsed && <span>Settings</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - User Profile */}
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-2">
          {!isCollapsed ? (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-2 h-auto hover:bg-sidebar-accent"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-sidebar-foreground/70 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-sidebar-foreground/70" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                  asChild
                >
                  <Link to="/dashboard/profile">Profile Settings</Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs text-destructive hover:text-destructive"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full p-2 justify-center"
              asChild
            >
              <Link to="/dashboard/profile">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}