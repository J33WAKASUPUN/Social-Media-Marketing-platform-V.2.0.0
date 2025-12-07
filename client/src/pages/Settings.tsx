import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/ProfileSettings";
import { TwoFactorSettings } from "@/components/TwoFactorSettings";
import { OrganizationSettings } from "@/components/OrganizationSettings";
import { BrandSettings } from "@/components/BrandSettings";
import { TeamSettings } from "@/components/TeamSettings";
import { ThemeSettings } from "@/components/ThemeSettings";
import { TourSettings } from '@/components/TourSettings';
import { 
  UserCircle, 
  Shield, 
  Building2, 
  Tag, 
  Users,
  Palette,
  GraduationCap
} from "lucide-react";

const Settings = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, security, appearance, organizations, brands, and team members"
      />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex-wrap" data-tour="settings-tabs">
          <TabsTrigger value="profile" data-tour="profile-tab">
            <UserCircle className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" data-tour="security-tab">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" data-tour="appearance-tab">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="organization" data-tour="organization-tab">
            <Building2 className="h-4 w-4 mr-2" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="brands" data-tour="brand-tab">
            <Tag className="h-4 w-4 mr-2" />
            Brands
          </TabsTrigger>
          <TabsTrigger value="team" data-tour="team-tab">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
          {/* New Tours Tab */}
          <TabsTrigger value="tours">
            <GraduationCap className="h-4 w-4 mr-2" />
            Tours
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

        <TabsContent value="tours">
          <TourSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;