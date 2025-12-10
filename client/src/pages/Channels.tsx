import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformBadge } from "@/components/PlatformBadge";
import { RefreshCw, Link as LinkIcon, AlertCircle, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useBrand } from '@/contexts/BrandContext';
import { channelApi } from '@/services/channelApi';
import { Channel, PlatformType } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Supported Platforms Configuration
const SUPPORTED_PLATFORMS: Array<{
  id: PlatformType;
  name: string;
  description: string;
  requiresOAuth: boolean;
}> = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Connect with professionals and share business updates',
    requiresOAuth: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Reach your audience on the world\'s largest social network',
    requiresOAuth: true,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    description: 'Share quick updates and engage in real-time conversations',
    requiresOAuth: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Share visual stories and connect through photos and videos',
    requiresOAuth: true,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Upload and share video content with your audience',
    requiresOAuth: true,
  },
  // ✅ ADD: WhatsApp (Manual Setup)
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Send messages and templates to your customers',
    requiresOAuth: false,
  },
];

export default function Channels() {
  const navigate = useNavigate();
  const { currentBrand } = useBrand();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<PlatformType | null>(null);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  
  // ✅ WhatsApp Setup Dialog State
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [whatsappSetup, setWhatsappSetup] = useState({
    phoneNumberId: '',
    businessAccountId: '',
    accessToken: '',
  });

  // Fetch Channels on Load
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

  // Handle Connect Button Click
  const handleConnect = async (platform: PlatformType) => {
    if (!currentBrand) {
      toast.error('Please select a brand first');
      return;
    }

    // ✅ Special handling for WhatsApp (Open Dialog)
    if (platform === 'whatsapp') {
      setShowWhatsAppDialog(true);
      return;
    }

    // Handle OAuth Platforms
    try {
      setConnectingPlatform(platform);
      const response = await channelApi.getOAuthUrl(platform, currentBrand._id);
      
      // Redirect to external OAuth provider
      window.location.href = response.data.authUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to connect ${platform}`);
      setConnectingPlatform(null);
    }
  };

  // ✅ Handle WhatsApp Connection (Submit Form)
  const handleConnectWhatsApp = async () => {
    if (!currentBrand) {
      toast.error('Please select a brand first');
      return;
    }

    const { phoneNumberId, businessAccountId, accessToken } = whatsappSetup;
    
    if (!phoneNumberId || !businessAccountId || !accessToken) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setConnectingPlatform('whatsapp');
      
      // Call your backend API directly
      const response = await fetch(`${import.meta.env.VITE_API_URL}/whatsapp/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          brandId: currentBrand._id,
          phoneNumberId,
          businessAccountId,
          accessToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to connect WhatsApp');
      }

      toast.success('WhatsApp Business Account connected successfully!');
      setShowWhatsAppDialog(false);
      setWhatsappSetup({ phoneNumberId: '', businessAccountId: '', accessToken: '' });
      
      // Refresh list and go to inbox
      await fetchChannels();
      navigate('/whatsapp/inbox');

    } catch (error: any) {
      toast.error(error.message || 'Failed to connect WhatsApp');
    } finally {
      setConnectingPlatform(null);
    }
  };

  // Test Connection
  const handleTestConnection = async (channelId: string, provider: string) => {
    try {
      setTestingChannel(channelId);
      await channelApi.testConnection(channelId);
      toast.success(`${provider} connection is working!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `${provider} connection failed`);
    } finally {
      setTestingChannel(null);
    }
  };

  // Disconnect Channel
  const handleDisconnect = async (channelId: string, provider: string) => {
    if (!confirm(`Are you sure you want to disconnect ${provider}?`)) return;

    try {
      await channelApi.disconnect(channelId);
      toast.success(`${provider} disconnected successfully`);
      fetchChannels();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disconnect channel');
    }
  };

  // Filter available platforms
  const connectedPlatformIds = channels
    .filter(ch => ch.connectionStatus === 'active')
    .map(ch => ch.provider);
  
  const availablePlatforms = SUPPORTED_PLATFORMS.filter(
    p => !connectedPlatformIds.includes(p.id)
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

      {/* --- CONNECTED CHANNELS SECTION --- */}
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-12 w-12" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : channels.filter(ch => ch.connectionStatus === 'active').length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <LinkIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No channels connected</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your social media accounts to start scheduling posts
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {channels
              .filter(ch => ch.connectionStatus === 'active')
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
                      
                      {/* ✅ WhatsApp Specific Info */}
                      {channel.provider === 'whatsapp' && channel.providerData && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Quality:</span>
                            <Badge variant={
                              channel.providerData.qualityRating === 'GREEN' ? 'default' :
                              channel.providerData.qualityRating === 'YELLOW' ? 'secondary' :
                              'destructive'
                            }>
                              {channel.providerData.qualityRating || 'UNKNOWN'}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => navigate('/whatsapp/inbox')}
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Open Inbox
                          </Button>
                        </div>
                      )}
                      
                      {/* Standard Social Info */}
                      {channel.provider !== 'whatsapp' && channel.providerData && (
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {channel.providerData.followers !== undefined && (
                            <span>{channel.providerData.followers} followers</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleTestConnection(channel._id, channel.provider)}
                        disabled={testingChannel === channel._id}
                      >
                        <RefreshCw
                          className={`mr-2 h-3.5 w-3.5 ${
                            testingChannel === channel._id ? 'animate-spin' : ''
                          }`}
                        />
                        {testingChannel === channel._id ? 'Testing...' : 'Test'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDisconnect(channel._id, channel.provider)}
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

      {/* --- AVAILABLE PLATFORMS SECTION --- */}
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
                    onClick={() => handleConnect(platform.id)}
                    disabled={connectingPlatform === platform.id}
                    className="w-full"
                  >
                    {connectingPlatform === platform.id ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        {platform.requiresOAuth ? 'Connect' : 'Setup'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* --- WHATSAPP SETUP DIALOG --- */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Connect WhatsApp Business
            </DialogTitle>
            <DialogDescription>
              Enter your WhatsApp Business API credentials from Meta Business Manager.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumberId">
                Phone Number ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phoneNumberId"
                placeholder="e.g. 10056044..."
                value={whatsappSetup.phoneNumberId}
                onChange={(e) => setWhatsappSetup({ ...whatsappSetup, phoneNumberId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessAccountId">
                Business Account ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="businessAccountId"
                placeholder="e.g. 13621440..."
                value={whatsappSetup.businessAccountId}
                onChange={(e) => setWhatsappSetup({ ...whatsappSetup, businessAccountId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessToken">
                Access Token <span className="text-destructive">*</span>
              </Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="EAAvVzs..."
                value={whatsappSetup.accessToken}
                onChange={(e) => setWhatsappSetup({ ...whatsappSetup, accessToken: e.target.value })}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Ensure your System User has 'Full Control' permission on the WhatsApp Account.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWhatsAppDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnectWhatsApp} disabled={connectingPlatform === 'whatsapp'}>
              {connectingPlatform === 'whatsapp' ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}