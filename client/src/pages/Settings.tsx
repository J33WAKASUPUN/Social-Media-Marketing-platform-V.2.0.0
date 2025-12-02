import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/ProfileSettings";
import { TwoFactorSettings } from "@/components/TwoFactorSettings";
import { OrganizationSettings } from "@/components/OrganizationSettings";
import { BrandSettings } from "@/components/BrandSettings";
import { TeamSettings } from "@/components/TeamSettings";
import { ThemeSettings } from "@/components/ThemeSettings";
import { 
  UserCircle, 
  Shield, 
  Building2, 
  Tag, 
  Users,
  Palette
} from "lucide-react";

const Settings = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, security, appearance, organizations, brands, and team members"
      />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="brands" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Brands
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="security">
          <TwoFactorSettings />
        </TabsContent>

        <TabsContent value="appearance">
          <ThemeSettings />
        </TabsContent>

        <TabsContent value="organization">
          <OrganizationSettings />
        </TabsContent>

        <TabsContent value="brands">
          <BrandSettings />
        </TabsContent>

        <TabsContent value="team">
          <TeamSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;