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
  ChevronRight,
  MessageCircle,
  MessageSquare,
  Users,
  Phone,
  ChevronDown,
  Sparkles,
  AlertTriangle,
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
  // ❌ TEMPORARILY DISABLED: WhatsApp Feature (Coming in v2.1)
  // {
  //   title: "WhatsApp",
  //   icon: MessageCircle,
  //   requiredPermission: 'canConnectChannels',
  //   tourId: "menu-whatsapp",
  //   children: [
  //     { 
  //       title: "Inbox", 
  //       url: "/whatsapp/inbox", 
  //       icon: MessageSquare,
  //       tourId: "menu-whatsapp-inbox"
  //     },
  //     { 
  //       title: "Templates", 
  //       url: "/whatsapp/templates", 
  //       icon: FileText,
  //       tourId: "menu-whatsapp-templates"
  //     },
  //     { 
  //       title: "Contacts", 
  //       url: "/whatsapp/contacts", 
  //       icon: Users,
  //       tourId: "menu-whatsapp-contacts"
  //     },
  //     { 
  //       title: "Call Logs", 
  //       url: "/whatsapp/calls", 
  //       icon: Phone,
  //       tourId: "menu-whatsapp-calls"
  //     },
  //   ]
  // },
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
    requiredPermission: 'canCreatePosts', // Editor, Manager, Owner only
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

  const [whatsappOpen, setWhatsappOpen] = useState(
    location.pathname.startsWith('/whatsapp')
  );
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (url: string) => {
    if (url === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(url);
  };

  const visibleMenuItems = menuItems.filter(item => {
    if (!item.requiredPermission) return true;
    return permissions[item.requiredPermission as keyof typeof permissions];
  });

  return (
    <TooltipProvider delayDuration={100} skipDelayDuration={0}>
      <Sidebar data-tour="sidebar" collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            {/* Logo Section */}
            <SidebarGroupLabel className="px-4 py-6">
              <NavLink to="/dashboard" className="flex items-center gap-0">
                <img 
                  src="/logo.png" 
                  alt="SocialFlow" 
                  className="h-10 w-10"
                />
                {!isCollapsed && (
                  <span className="ml-2 text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300">
                    SocialFlow
                  </span>
                )}
              </NavLink>
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {visibleMenuItems.map((item) => {
                  const Icon = item.icon;

                  // ==========================
                  // 1. NESTED MENU (WhatsApp)
                  // ==========================
                  if (item.children) {
                    const isParentActive = location.pathname.startsWith('/whatsapp');
                    
                    return (
                      <Collapsible
                        key={item.title}
                        open={whatsappOpen}
                        onOpenChange={setWhatsappOpen}
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
                                          "transition-colors flex-1 text-left truncate",
                                          isParentActive && "font-medium"
                                        )}>
                                          {item.title}
                                        </span>
                                        <ChevronDown className={cn(
                                          "ml-auto h-4 w-4 shrink-0 transition-transform",
                                          whatsappOpen && "rotate-180"
                                        )} />
                                      </>
                                    )}
                                  </div>
                                </SidebarMenuButton>
                              </CollapsibleTrigger>
                            </TooltipTrigger>
                            
                            {isCollapsed && (
                              <TooltipContent 
                                side="right" 
                                sideOffset={10} 
                                className="z-[100] bg-popover text-popover-foreground border shadow-md font-medium"
                              >
                                {item.title}
                              </TooltipContent>
                            )}
                          </Tooltip>

                          <CollapsibleContent className={isCollapsed ? "hidden" : ""}>
                            <SidebarMenuSub>
                              {item.children.map((subItem) => {
                                const SubIcon = subItem.icon;
                                const isSubActive = location.pathname === subItem.url;
                                return (
                                  <SidebarMenuSubItem key={subItem.url}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isSubActive}
                                      onClick={() => navigate(subItem.url)}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex items-center gap-2">
                                        <SubIcon className="h-4 w-4" />
                                        <span>{subItem.title}</span>
                                      </div>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }

                  // ==========================
                  // 2. STANDARD MENU ITEMS
                  // ==========================
                  const active = isActive(item.url!);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            isActive={active}
                            data-tour={item.tourId}
                            className={cn(
                              "group relative",
                              active && "bg-accent text-accent-foreground"
                            )}
                          >
                            <NavLink to={item.url!} className="flex items-center gap-3">
                              <Icon className={cn(
                                "h-5 w-5 shrink-0 transition-colors",
                                active ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                              )} />
                              
                              {!isCollapsed && (
                                <>
                                  <span className={cn(
                                    "transition-colors truncate",
                                    active && "font-medium"
                                  )}>
                                    {item.title}
                                  </span>
                                  {active && (
                                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-primary" />
                                  )}
                                </>
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

        <SidebarFooter data-tour="user-menu">
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
                      onClick={handleLogoutClick}
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

      {/* LOGOUT CONFIRMATION DIALOG */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}