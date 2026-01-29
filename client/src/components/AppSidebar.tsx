import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Image,
  BarChart3,
  Share2,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  PlusCircle,
  Layers,
  AlertTriangle,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

const menuItems = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: LayoutDashboard,
    requiredPermission: null,
    tourId: "menu-dashboard"
  },
  {
    title: "Create Post",
    icon: PlusCircle,
    requiredPermission: 'canCreatePosts',
    tourId: "menu-create-post",
    children: [
      { 
        title: "Single Post", 
        url: "/posts/new", 
        icon: FileText,
        tourId: "menu-single-post"
      },
      { 
        title: "Bulk Post", 
        url: "/bulk-publish/new", 
        icon: Layers,
        tourId: "menu-bulk-post"
      },
    ]
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
    title: "Content Assistant", 
    url: "/ai-chat", 
    icon: Sparkles,
    requiredPermission: 'canCreatePosts',
    tourId: "menu-ai-chat"
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

  const [createPostOpen, setCreatePostOpen] = useState(
    location.pathname.startsWith('/posts/new') || location.pathname.startsWith('/bulk-publish')
  );
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => setShowLogoutDialog(true);

  const handleConfirmLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon" className="border-r" data-tour="sidebar">
        <SidebarContent className="py-2">
          <SidebarGroup>
            {/* Logo Section */}
            <SidebarGroupLabel className="px-4 py-6">
              <NavLink to="/dashboard" className="flex items-center gap-0">
                <img src="/logo.png" alt="SocialFlow" className="h-10 w-10" />
                {!isCollapsed && (
                  <span className="ml-2 text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300">
                    SocialFlow
                  </span>
                )}
              </NavLink>
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  
                  // Permission Check
                  if (item.requiredPermission && !permissions[item.requiredPermission as keyof typeof permissions]) {
                    return null;
                  }

                  // ==========================
                  // 1. NESTED MENU (Collapsible)
                  // ==========================
                  if (item.children) {
                    const isParentActive = item.children.some(child => 
                      location.pathname === child.url || location.pathname.startsWith(child.url + '/')
                    );
                    
                    return (
                      <Collapsible
                        key={item.title}
                        open={createPostOpen}
                        onOpenChange={setCreatePostOpen}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton
                                  data-tour={item.tourId} 
                                  className={cn(
                                    "group relative w-full",
                                    isParentActive && "bg-accent text-accent-foreground"
                                  )}
                                >
                                  <div className="flex items-center gap-3 w-full">
                                    <Icon className={cn(
                                      "h-5 w-5 shrink-0 transition-colors",
                                      isParentActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                    )} />
                                    
                                    {!isCollapsed && (
                                      <>
                                        <span className={cn(
                                          "flex-1 text-left truncate",
                                          isParentActive && "font-medium"
                                        )}>
                                          {item.title}
                                        </span>
                                        <ChevronDown className={cn(
                                          "h-4 w-4 shrink-0 transition-transform text-muted-foreground",
                                          createPostOpen && "rotate-180"
                                        )} />
                                      </>
                                    )}
                                  </div>
                                </SidebarMenuButton>
                              </CollapsibleTrigger>
                            </TooltipTrigger>
                            {isCollapsed && (
                              <TooltipContent side="right" sideOffset={10}>
                                <p className="font-medium">{item.title}</p>
                                <div className="mt-2 space-y-1">
                                  {item.children.map(child => (
                                    <Link key={child.url} to={child.url} className="block text-sm text-muted-foreground hover:text-foreground py-1">
                                      {child.title}
                                    </Link>
                                  ))}
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </SidebarMenuItem>

                        {!isCollapsed && (
                          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                            <SidebarMenuSub>
                              {item.children.map((child) => {
                                const ChildIcon = child.icon;
                                const isChildActive = location.pathname === child.url || location.pathname.startsWith(child.url + '/');
                                
                                return (
                                  <SidebarMenuSubItem key={child.title}>
                                    <SidebarMenuSubButton
                                      asChild
                                      data-tour={child.tourId}
                                      className={cn(isChildActive && "bg-accent text-accent-foreground font-medium")}
                                    >
                                      <Link to={child.url}>
                                        <ChildIcon className={cn(
                                          "h-4 w-4 mr-2",
                                          isChildActive ? "text-primary" : "text-muted-foreground"
                                        )} />
                                        <div className="flex flex-col">
                                          <span>{child.title}</span>
                                          {child.description && (
                                            <span className="text-[10px] opacity-70 leading-tight">{child.description}</span>
                                          )}
                                        </div>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    );
                  }

                  // ==========================
                  // 2. STANDARD MENU ITEMS
                  // ==========================
                  const isActive = item.url === '/posts' 
                    ? location.pathname === '/posts' 
                    : location.pathname === item.url || location.pathname.startsWith(item.url + '/');

                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            data-tour={item.tourId}
                            className={cn(isActive && "bg-accent text-accent-foreground")}
                          >
                            <Link to={item.url!}>
                              <Icon className={cn(
                                "h-5 w-5 shrink-0 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                              )} />
                              {!isCollapsed && (
                                <span className={cn(isActive && "font-medium")}>
                                  {item.title}
                                </span>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side="right" sideOffset={10}>
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

        <SidebarFooter data-tour="user-menu">
          <div className={cn("border-t transition-all duration-200", isCollapsed ? "p-2" : "p-4")}>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-full" onClick={() => navigate("/settings")}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl || user?.avatar} />
                      <AvatarFallback>{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  <p className="font-medium">{user?.name}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 cursor-pointer" onClick={() => navigate("/settings")}>
                  <AvatarImage src={user?.avatarUrl || user?.avatar} />
                  <AvatarFallback>{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogoutClick}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" /> Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to log out?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}