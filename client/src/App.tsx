import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { BrandProvider } from "@/contexts/BrandContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TourProvider } from "@/contexts/TourContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { WelcomeTourDialog } from "@/components/WelcomeTourDialog";
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import GoogleCallback from "@/pages/GoogleCallback";
import TwoFactorVerify from "@/pages/TwoFactorVerify";
import Dashboard from "@/pages/Dashboard";
import Posts from "@/pages/Posts";
import PostComposer from "@/pages/PostComposer";
import EditPost from "@/pages/EditPost";
import Calendar from "@/pages/Calendar";
import Analytics from "@/pages/Analytics";
import Channels from "@/pages/Channels";
import Media from "@/pages/Media";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import WhatsAppInbox from '@/pages/whatsapp/Inbox';
import WhatsAppTemplates from '@/pages/whatsapp/Templates';
import WhatsAppContacts from '@/pages/whatsapp/Contacts';
import WhatsAppCallLogs from '@/pages/whatsapp/CallLogs';

const queryClient = new QueryClient();

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex-1">
        <AppHeader />
        <main className="animate-fade-in">{children}</main>
      </div>
    </div>
    {/* Welcome Tour Dialog - Shows for new users */}
    <WelcomeTourDialog />
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <OrganizationProvider>
          <BrandProvider>
            <NotificationProvider>
              {/* TourProvider must wrap components that use useTour */}
              <TourProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      {/* Public Routes (Unchanged) */}
                      <Route path="/" element={<Navigate to="/login" replace />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/google/callback" element={<GoogleCallback />} />
                      <Route path="/2fa-verify" element={<TwoFactorVerify />} />

                      {/* Protected Routes - Require Authentication */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <MainLayout>
                              <Dashboard />
                            </MainLayout>
                          </ProtectedRoute>
                        }
                      />

                      {/* Posts - Require canViewPosts */}
                      <Route
                        path="/posts"
                        element={
                          <ProtectedRoute>
                            <RoleProtectedRoute requiredPermission="canViewPosts">
                              <MainLayout>
                                <Posts />
                              </MainLayout>
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        }
                      />

                      {/* Create Post - Require canCreatePosts */}
                      <Route
                        path="/posts/new"
                        element={
                          <ProtectedRoute>
                            <RoleProtectedRoute requiredPermission="canCreatePosts">
                              <MainLayout>
                                <PostComposer />
                              </MainLayout>
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        }
                      />

                      {/* Edit Post - Require canCreatePosts */}
                      <Route
                        path="/posts/edit/:id"
                        element={
                          <ProtectedRoute>
                            <RoleProtectedRoute requiredPermission="canCreatePosts">
                              <MainLayout>
                                <EditPost />
                              </MainLayout>
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        }
                      />

                      {/* Calendar - Require canViewPosts */}
                      <Route
                        path="/calendar"
                        element={
                          <ProtectedRoute>
                            <RoleProtectedRoute requiredPermission="canViewPosts">
                              <MainLayout>
                                <Calendar />
                              </MainLayout>
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        }
                      />

                      {/* Analytics - Require canViewAnalytics */}
                      <Route
                        path="/analytics"
                        element={
                          <ProtectedRoute>
                            <RoleProtectedRoute requiredPermission="canViewAnalytics">
                              <MainLayout>
                                <Analytics />
                              </MainLayout>
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        }
                      />

                      {/* Channels - Require canConnectChannels */}
                      <Route
                        path="/channels"
                        element={
                          <ProtectedRoute>
                            <RoleProtectedRoute requiredPermission="canConnectChannels">
                              <MainLayout>
                                <Channels />
                              </MainLayout>
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        }
                      />

                      {/* ✅ ADDED: WhatsApp Routes (Require canConnectChannels) */}
                      <Route
                        path="/whatsapp/inbox"
                        element={
                          <ProtectedRoute>
                            <RoleProtectedRoute requiredPermission="canConnectChannels">
                              <MainLayout>
                                <WhatsAppInbox />
                              </MainLayout>
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/whatsapp/templates"
                        element={
                          <ProtectedRoute>
                            <RoleProtectedRoute requiredPermission="canConnectChannels">
                              <MainLayout>
                                <WhatsAppTemplates />
                              </MainLayout>
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/whatsapp/contacts"
                        element={
                          <ProtectedRoute>
                            <RoleProtectedRoute requiredPermission="canConnectChannels">
                              <MainLayout>
                                <WhatsAppContacts />
                              </MainLayout>
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/whatsapp/calls"
                        element={
                          <ProtectedRoute>
                            <RoleProtectedRoute requiredPermission="canConnectChannels">
                              <MainLayout>
                                <WhatsAppCallLogs />
                              </MainLayout>
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        }
                      />

                      {/* Media Library - Require canViewMedia */}
                      <Route
                        path="/media"
                        element={
                          <ProtectedRoute>
                            <RoleProtectedRoute requiredPermission="canViewMedia">
                              <MainLayout>
                                <Media />
                              </MainLayout>
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        }
                      />

                      {/* Settings - No special permission required */}
                      <Route
                        path="/settings"
                        element={
                          <ProtectedRoute>
                            <MainLayout>
                              <Settings />
                            </MainLayout>
                          </ProtectedRoute>
                        }
                      />

                      {/* 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </TourProvider>
            </NotificationProvider>
          </BrandProvider>
        </OrganizationProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;