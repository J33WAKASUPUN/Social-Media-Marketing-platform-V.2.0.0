import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/ProfileSettings";
import { TwoFactorSettings } from "@/components/TwoFactorSettings";
import { OrganizationSettings } from "@/components/OrganizationSettings";
import { BrandSettings } from "@/components/BrandSettings";
import { TeamSettings } from "@/components/TeamSettings";
import { ThemeSettings } from "@/components/ThemeSettings";
import { TourSettings } from '@/components/TourSettings';
import { Button } from "@/components/ui/button"; 
import { 
  UserCircle, 
  Shield, 
  Building2, 
  Tag, 
  Users,
  Palette,
  GraduationCap,
  RefreshCw,
  Download
} from "lucide-react";

const Settings = () => {
  return (
    <div className="w-full p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Settings"
          description="Manage your profile, security, and team preferences"
        />
        
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="hidden md:flex gap-2">
             <RefreshCw className="h-4 w-4" />
             Refresh
           </Button>
           <Button variant="outline" size="sm" className="hidden md:flex gap-2">
             <Download className="h-4 w-4" />
             Export
           </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <div className="w-full overflow-x-auto pb-2 md:pb-0">
            <TabsList className="w-full h-auto p-2 bg-muted/60 rounded-xl text-muted-foreground flex items-center gap-1">
              
              <TabsTrigger 
                value="profile" 
                data-tour="settings-profile" // ✅ Added
                className="w-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2.5 rounded-lg transition-all flex items-center justify-center"
              >
                <UserCircle className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              
              <TabsTrigger 
                value="security" 
                data-tour="settings-security" // ✅ Added
                className="w-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2.5 rounded-lg transition-all flex items-center justify-center"
              >
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              
              <TabsTrigger 
                value="appearance" 
                data-tour="settings-appearance" // ✅ Added
                className="w-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2.5 rounded-lg transition-all flex items-center justify-center"
              >
                <Palette className="h-4 w-4 mr-2" />
                Appearance
              </TabsTrigger>
              
              <TabsTrigger 
                value="organization" 
                data-tour="settings-organization" // ✅ Added
                className="w-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2.5 rounded-lg transition-all flex items-center justify-center"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Organization
              </TabsTrigger>
              
              <TabsTrigger 
                value="brands" 
                data-tour="settings-brands" // ✅ Added
                className="w-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2.5 rounded-lg transition-all flex items-center justify-center"
              >
                <Tag className="h-4 w-4 mr-2" />
                Brands
              </TabsTrigger>
              
              <TabsTrigger 
                value="team" 
                data-tour="settings-team" // ✅ Added
                className="w-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2.5 rounded-lg transition-all flex items-center justify-center"
              >
                <Users className="h-4 w-4 mr-2" />
                Team
              </TabsTrigger>
              
              <TabsTrigger 
                value="tours"
                data-tour="settings-tours" // ✅ Added
                className="w-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2.5 rounded-lg transition-all flex items-center justify-center"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Tours
              </TabsTrigger>
            </TabsList>
        </div>

        {/* Content Area */}
        <div className="mt-6">
            <TabsContent value="profile"><ProfileSettings /></TabsContent>
            <TabsContent value="security"><TwoFactorSettings /></TabsContent>
            <TabsContent value="appearance"><ThemeSettings /></TabsContent>
            <TabsContent value="organization"><OrganizationSettings /></TabsContent>
            <TabsContent value="brands"><BrandSettings /></TabsContent>
            <TabsContent value="team"><TeamSettings /></TabsContent>
            <TabsContent value="tours"><TourSettings /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;