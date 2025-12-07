import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformBadge } from "@/components/PlatformBadge";
import { RefreshCw, Link as LinkIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useBrand } from '@/contexts/BrandContext';
import { channelApi } from '@/services/channelApi';
import { Channel, PlatformType } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Only 5 platforms we support
const SUPPORTED_PLATFORMS: Array<{
  id: PlatformType;
  name: string;
  description: string;
}> = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Connect with professionals and share business updates',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Reach your audience on the world\'s largest social network',
  },
  {
    id: 'twitter',
    name: 'Twitter',
    description: 'Share quick updates and engage in real-time conversations',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Share visual stories and connect through photos and videos',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Upload and share video content with your audience',
  },
];

export default function Channels() {
  const navigate = useNavigate();
  const { currentBrand } = useBrand();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<PlatformType | null>(null);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);

  // FETCH CHANNELS FROM BACKEND
  useEffect(() => {
    if (currentBrand) {
      fetchChannels();
    }
  }, [currentBrand]);

  const fetchChannels = async () => {
    if (!currentBrand) return;

    try {
      setLoading(true);
      const response = await channelApi.getAll(currentBrand._id);
      setChannels(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  // CONNECT TO PLATFORM (OAUTH)
  const handleConnect = async (platform: PlatformType) => {
    if (!currentBrand) {
      toast.error('Please select a brand first');
      return;
    }

    try {
      setConnectingPlatform(platform);
      
      // Get OAuth URL from backend
      const response = await channelApi.getOAuthUrl(platform, currentBrand._id);
      
      toast.success(`Redirecting to ${platform}...`);
      
      // Redirect to OAuth provider
      window.location.href = response.data.authUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to connect to ${platform}`);
      setConnectingPlatform(null);
    }
  };

  // Pass channelId instead of platform name
  const handleDisconnect = async (channelId: string, platformName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platformName}?`)) return;

    try {
      await channelApi.disconnect(channelId);
      toast.success(`Disconnected from ${platformName}`);
      fetchChannels(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disconnect channel');
    }
  };

  // Pass channelId instead of platform name
  const handleTestConnection = async (channelId: string, platformName: string) => {
    try {
      setTestingChannel(channelId);
      await channelApi.testConnection(channelId);
      toast.success(`Connection to ${platformName} is working!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Connection to ${platformName} failed`);
    } finally {
      setTestingChannel(null);
    }
  };

  // CHECK IF PLATFORM IS CONNECTED
  const isPlatformConnected = (platform: PlatformType): Channel | undefined => {
    return channels.find(
      (ch) => ch.provider === platform && ch.connectionStatus === 'active'
    );
  };

  // GET AVAILABLE PLATFORMS (NOT CONNECTED)
  const availablePlatforms = SUPPORTED_PLATFORMS.filter(
    (platform) => !isPlatformConnected(platform.id)
  );

  if (!currentBrand) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Brand Selected</AlertTitle>
          <AlertDescription className="mt-2">
            Please select a brand from the sidebar to manage channels.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Channels"
        description="Manage your connected social media accounts"
      />

      {/* CONNECTED CHANNELS */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Connected Channels</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your active social media connections
            </p>
          </div>
          <Button variant="outline" onClick={fetchChannels} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : channels.filter((ch) => ch.connectionStatus === 'active').length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Connected Channels</AlertTitle>
            <AlertDescription>
              Connect your first social media account below to start publishing.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {channels
              .filter((ch) => ch.connectionStatus === 'active')
              .map((channel) => (
                <Card
                  key={channel._id}
                  className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <PlatformBadge platform={channel.provider} size="lg" />
                      <Badge className="bg-success/10 text-success border-success/20 font-medium">
                        ● Connected
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <p className="font-medium text-lg">{channel.displayName}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        @{channel.platformUsername || channel.platformUserId}
                      </p>
                      {channel.providerData && (
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {channel.providerData.followers !== undefined && (
                            <div className="flex gap-1">
                              <span className="font-semibold text-foreground">
                                {channel.providerData.followers}
                              </span>
                              <span>followers</span>
                            </div>
                          )}
                          {channel.providerData.subscribers !== undefined && (
                            <div className="flex gap-1">
                              <span className="font-semibold text-foreground">
                                {channel.providerData.subscribers}
                              </span>
                              <span>subscribers</span>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="text-success">✓</span>
                        Connected on{' '}
                        {new Date(channel.connectedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      {/* Pass channel._id and channel.provider */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 group-hover:border-primary/50 transition-colors"
                        onClick={() => {
                          console.log('🧪 Test button clicked for:', channel.id); 
                          handleTestConnection(channel.id, channel.provider);     
                        }}
                        disabled={testingChannel === channel.id}                 
                       >
                        <RefreshCw
                          className={`mr-2 h-3.5 w-3.5 ${
                            testingChannel === channel.id ? 'animate-spin' : ''  
                          }`}
                        />
                        {testingChannel === channel.id ? 'Testing...' : 'Test Connection'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          console.log('🔌 Disconnect button clicked for:', channel.id); 
                          handleDisconnect(channel.id, channel.provider);                 
                        }}
                      >
                       Disconnect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* AVAILABLE PLATFORMS */}
      {availablePlatforms.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Available Platforms</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Expand your reach by connecting more platforms
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availablePlatforms.map((platform) => (
              <Card
                key={platform.id}
                className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="relative">
                  <PlatformBadge platform={platform.id} size="lg" />
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {platform.description}
                  </p>
                  <Button
                    variant="gradient"
                    className="w-full group-hover:shadow-lg transition-shadow"
                    onClick={() => handleConnect(platform.id)}
                    disabled={connectingPlatform === platform.id}
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    {connectingPlatform === platform.id
                      ? 'Connecting...'
                      : `Connect ${platform.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* DISCONNECTED CHANNELS (if any) */}
      {channels.filter((ch) => ch.connectionStatus !== 'active').length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Disconnected Channels</h2>
              <p className="text-sm text-muted-foreground mt-1">
                These channels need to be reconnected
              </p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {channels
              .filter((ch) => ch.connectionStatus !== 'active')
              .map((channel) => (
                <Card key={channel._id} className="border-destructive/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <PlatformBadge platform={channel.provider} size="lg" />
                      <Badge variant="destructive">Disconnected</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {channel.displayName} (@{channel.platformUsername})
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => handleConnect(channel.provider)}
                    >
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Reconnect
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}