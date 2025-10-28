import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Posts from "./pages/Posts";
import PostComposer from "./pages/PostComposer";
import Calendar from "./pages/Calendar";
import Media from "./pages/Media";
import Analytics from "./pages/Analytics";
import Channels from "./pages/Channels";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/posts" element={<MainLayout><Posts /></MainLayout>} />
          <Route path="/posts/new" element={<MainLayout><PostComposer /></MainLayout>} />
          <Route path="/calendar" element={<MainLayout><Calendar /></MainLayout>} />
          <Route path="/media" element={<MainLayout><Media /></MainLayout>} />
          <Route path="/analytics" element={<MainLayout><Analytics /></MainLayout>} />
          <Route path="/channels" element={<MainLayout><Channels /></MainLayout>} />
          <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
