import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockChannels } from "@/lib/mockData";
import { PlatformBadge } from "@/components/PlatformBadge";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function Channels() {
  const connectedChannels = mockChannels.filter((c) => c.connected);
  const availableChannels = mockChannels.filter((c) => !c.connected);

  const handleConnect = (platform: string) => {
    toast.success(`Connecting to ${platform}...`);
  };

  const handleDisconnect = (platform: string) => {
    toast.error(`Disconnected from ${platform}`);
  };

  const handleTestConnection = (platform: string) => {
    toast.success(`Connection to ${platform} is working!`);
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Channels"
        description="Manage your connected social media accounts"
      />

      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Connected Channels</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage your active social media connections</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {connectedChannels.map((channel) => (
            <Card key={channel.id} className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <PlatformBadge platform={channel.platform} size="lg" />
                  <Badge className="bg-success/10 text-success border-success/20 font-medium">
                    ● Connected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-semibold">{channel.username}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="font-semibold text-foreground">{channel.followers}</span>
                      <span className="text-muted-foreground">followers</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="text-success">✓</span>
                    Connected on {channel.connectedDate}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 group-hover:border-primary/50 transition-colors"
                    onClick={() => handleTestConnection(channel.name)}
                  >
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Test Connection
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDisconnect(channel.name)}
                  >
                    Disconnect
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Available Platforms</h2>
            <p className="text-sm text-muted-foreground mt-1">Expand your reach by connecting more platforms</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableChannels.map((channel) => (
            <Card key={channel.id} className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="relative">
                <PlatformBadge platform={channel.platform} size="lg" />
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Schedule and publish engaging content to {channel.name} and grow your audience
                </p>
                <Button
                  variant="gradient"
                  className="w-full group-hover:shadow-lg transition-shadow"
                  onClick={() => handleConnect(channel.name)}
                >
                  Connect {channel.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
