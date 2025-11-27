import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { BrandProvider } from "@/contexts/BrandContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GoogleCallback from "./pages/GoogleCallback";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";
import PostComposer from "./pages/PostComposer";
import Calendar from "./pages/Calendar";
import Media from "./pages/Media";
import Analytics from "./pages/Analytics";
import Channels from "./pages/Channels";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import EditPost from "./pages/EditPost";
import ResetPassword from "@/pages/ResetPassword";
import ForgotPassword from "@/pages/ForgotPassword";

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
  </SidebarProvider>
);

// 🔧 WRAP WITH NEW PROVIDERS
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OrganizationProvider>
        <BrandProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/auth/google/callback" element={<GoogleCallback />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <MainLayout><Dashboard /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/posts" element={
                    <ProtectedRoute>
                      <MainLayout><Posts /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/posts/new" element={
                    <ProtectedRoute>
                      <MainLayout><PostComposer /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/posts/edit/:id" element={
                    <ProtectedRoute>
                      <MainLayout><EditPost /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/calendar" element={
                    <ProtectedRoute>
                      <MainLayout><Calendar /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/media" element={
                    <ProtectedRoute>
                      <MainLayout><Media /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <MainLayout><Analytics /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/channels" element={
                    <ProtectedRoute>
                      <MainLayout><Channels /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <MainLayout><Settings /></MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </BrandProvider>
      </OrganizationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;