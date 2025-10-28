import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockUser } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    postPublished: true,
    postFailed: true,
    channelDisconnected: true,
    weeklySummary: false,
    teamMember: true,
  });

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved");
  };

  const handleChangePassword = () => {
    toast.success("Password updated successfully");
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="brand">Brand</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-gradient-primary text-2xl text-white">
                    {mockUser.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Change Avatar
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    JPG, PNG or WEBP. Max 2MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={mockUser.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex gap-2">
                    <Input id="email" defaultValue={mockUser.email} disabled />
                    <Badge className="bg-success text-success-foreground">Verified</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" defaultValue={mockUser.timezone} />
                </div>
              </div>

              <Button variant="gradient" onClick={handleSaveProfile}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button variant="gradient" onClick={handleChangePassword}>
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Post Published Successfully</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a post is published
                  </p>
                </div>
                <Switch
                  checked={notifications.postPublished}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, postPublished: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Post Failed to Publish</p>
                  <p className="text-sm text-muted-foreground">
                    Alert me when a post fails
                  </p>
                </div>
                <Switch
                  checked={notifications.postFailed}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, postFailed: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Channel Disconnected</p>
                  <p className="text-sm text-muted-foreground">
                    Notify when a channel loses connection
                  </p>
                </div>
                <Switch
                  checked={notifications.channelDisconnected}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, channelDisconnected: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Summary Email</p>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly performance report
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklySummary}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, weeklySummary: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Team Member Joined</p>
                  <p className="text-sm text-muted-foreground">
                    Alert when someone joins your team
                  </p>
                </div>
                <Switch
                  checked={notifications.teamMember}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, teamMember: checked })
                  }
                />
              </div>

              <Button variant="gradient" onClick={handleSaveNotifications}>
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input id="brand-name" placeholder="Your Brand" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-description">Description</Label>
                <Textarea
                  id="brand-description"
                  placeholder="Tell us about your brand..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">500 characters max</p>
              </div>

              <div className="space-y-2">
                <Label>Brand Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button variant="outline" size="sm">
                    Upload Logo
                  </Button>
                </div>
              </div>

              <Button variant="gradient">Save Brand Settings</Button>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Once you delete your brand, there is no going back. Please be certain.
              </p>
              <Button variant="destructive">Delete Brand</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
