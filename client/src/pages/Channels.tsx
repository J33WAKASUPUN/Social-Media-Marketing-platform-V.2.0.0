import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformBadge } from "@/components/PlatformBadge";
import { RefreshCw, Link as LinkIcon, AlertCircle, MessageCircle, Trash2, AlertTriangle } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Supported Platforms
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
  // ❌ DISABLED: WhatsApp (Coming in v2.1)
  // {
  //   id: 'whatsapp',
  //   name: 'WhatsApp Business',
  //   description: 'Enable with your audience. Send messages and templates to your customers',
  //   requiresOAuth: false,
  // },
];

export default function Channels() {
  const navigate = useNavigate();
  const { currentBrand } = useBrand();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<PlatformType | null>(null);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);

  // WhatsApp Dialog State
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [whatsappSetup, setWhatsappSetup] = useState({
    phoneNumberId: '',
    businessAccountId: '',
    accessToken: '',
  });

  // Disconnect & Delete Dialog States
  const [disconnectingChannel, setDisconnectingChannel] = useState<Channel | null>(null);
  const [deletingChannel, setDeletingChannel] = useState<Channel | null>(null);
  const [deleteImpact, setDeleteImpact] = useState<any>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);

  // FETCH CHANNELS
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

  // HANDLE CONNECT
  const handleConnect = async (platform: PlatformType) => {
    if (!currentBrand) {
      toast.error('Please select a brand first');
      return;
    }

    if (platform === 'whatsapp') {
      setShowWhatsAppDialog(true);
      return;
    }

    try {
      setConnectingPlatform(platform);
      const response = await channelApi.getOAuthUrl(platform, currentBrand._id);
      toast.success(`Redirecting to ${platform}...`);
      window.location.href = response.data.authUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to connect to ${platform}`);
      setConnectingPlatform(null);
    }
  };

  // HANDLE WHATSAPP CONNECT
  const handleConnectWhatsApp = async () => {
    if (!currentBrand) return;

    const { phoneNumberId, businessAccountId, accessToken } = whatsappSetup;
    
    if (!phoneNumberId || !businessAccountId || !accessToken) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setConnectingPlatform('whatsapp');
      
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
      
      await fetchChannels();
      navigate('/whatsapp/inbox');

    } catch (error: any) {
      toast.error(error.message || 'Failed to connect WhatsApp');
    } finally {
      setConnectingPlatform(null);
    }
  };

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

  // OPEN DISCONNECT DIALOG
  const handleOpenDisconnectDialog = (channel: Channel) => {
    setDisconnectingChannel(channel);
  };

  // CONFIRM DISCONNECT
  const handleConfirmDisconnect = async () => {
    if (!disconnectingChannel) return;

    try {
      await channelApi.disconnect(disconnectingChannel._id);
      toast.success(`Disconnected from ${disconnectingChannel.displayName}`);
      setDisconnectingChannel(null);
      fetchChannels();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to disconnect channel');
    }
  };

  // OPEN DELETE DIALOG
  const handleOpenDeleteDialog = async (channel: Channel) => {
    setDeletingChannel(channel);
    setLoadingImpact(true);

    try {
      const response = await channelApi.getDeleteImpact(channel._id);
      setDeleteImpact(response.data);
    } catch (error: any) {
      toast.error('Failed to load delete impact details');
      setDeleteImpact(null);
    } finally {
      setLoadingImpact(false);
    }
  };

  // CONFIRM DELETE
  const handleConfirmDelete = async () => {
    if (!deletingChannel) return;

    try {
      await channelApi.permanentlyDelete(deletingChannel._id);
      toast.success(`${deletingChannel.displayName} permanently deleted`);
      setDeletingChannel(null);
      setDeleteImpact(null);
      fetchChannels();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete channel');
    }
  };

  const isPlatformConnected = (platformId: PlatformType): boolean => {
    return channels.some(
      (ch) => ch.provider === platformId && ch.connectionStatus === 'active'
    );
  };

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
                      
                      {/* Standard Followers Display (Social Only) */}
                      {channel.provider !== 'whatsapp' && channel.providerData && (
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {channel.providerData.followers !== undefined && (
                            <div className="flex gap-1">
                              <span className="font-semibold text-foreground">
                                {channel.providerData.followers}
                              </span>
                              <span>followers</span>
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

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 group-hover:border-primary/50 transition-colors"
                        onClick={() => handleTestConnection(channel._id, channel.provider)}
                        disabled={testingChannel === channel._id}
                      >
                        <RefreshCw
                          className={`mr-2 h-3.5 w-3.5 ${
                            testingChannel === channel._id ? 'animate-spin' : ''
                          }`}
                        />
                        {testingChannel === channel._id ? 'Testing...' : 'Test Connection'}
                      </Button>

                      <Button
                        variant="outline" 
                        size="sm"
                        className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleOpenDisconnectDialog(channel)}
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
                    variant="default"
                    className="w-full group-hover:shadow-lg transition-shadow"
                    onClick={() => handleConnect(platform.id)}
                    disabled={connectingPlatform === platform.id}
                  >
                    {connectingPlatform === platform.id ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        {platform.requiresOAuth ? `Connect ${platform.name}` : 'Setup'}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* DISCONNECTED CHANNELS */}
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
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleConnect(channel.provider)}
                      >
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Reconnect
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleOpenDeleteDialog(channel)}
                        title="Permanently Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* WHATSAPP SETUP DIALOG */}
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

      {/* ✅ DISCONNECT CONFIRMATION DIALOG */}
      <AlertDialog 
        open={!!disconnectingChannel} 
        onOpenChange={(open) => !open && setDisconnectingChannel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Disconnect {disconnectingChannel?.displayName}?
            </AlertDialogTitle>
            
            {/* ✅ FIXED HTML STRUCTURE: Moved complex content outside Description */}
            <AlertDialogDescription>
              This will pause the connection to your {disconnectingChannel?.provider} account.
            </AlertDialogDescription>

            <div className="space-y-3 pt-2 text-sm text-muted-foreground">
              {disconnectingChannel?.provider === 'whatsapp' ? (
                <ul className="list-disc list-inside space-y-1">
                  <li>You will stop receiving new customer messages.</li>
                  <li>You won't be able to send templates or replies.</li>
                  <li>Existing chat history will be preserved.</li>
                  <li>You can reconnect anytime later.</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  <li>You won't be able to publish to this channel.</li>
                  <li>Scheduled posts will be canceled.</li>
                  <li>Published posts will remain on {disconnectingChannel?.provider}.</li>
                  <li>You can reconnect anytime later.</li>
                </ul>
              )}
              
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> This is a soft disconnect. Your data is safe.
                </p>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDisconnect}
              className="bg-destructive hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PERMANENT DELETE CONFIRMATION DIALOG */}
      <AlertDialog 
        open={!!deletingChannel} 
        onOpenChange={(open) => {
          if (!open) {
            setDeletingChannel(null);
            setDeleteImpact(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Permanently Delete {deletingChannel?.displayName}?
            </AlertDialogTitle>
            
            {/* ✅ FIXED HTML STRUCTURE */}
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your channel data.
            </AlertDialogDescription>

            <div className="space-y-4 pt-2 text-sm text-muted-foreground">
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20 text-foreground">
                <p className="font-semibold text-destructive mb-2">⚠️ Warning</p>
                <p className="text-sm">
                  This will permanently delete all data associated with this channel from our database.
                </p>
              </div>

              {loadingImpact ? (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Calculating impact...
                  </span>
                </div>
              ) : deleteImpact ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium">What will be deleted:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive">•</span>
                      <span>
                        <strong>{deleteImpact.impact.publishedPosts}</strong> published post records 
                        from our database
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive">•</span>
                      <span>All connection credentials and tokens</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive">•</span>
                      <span>Channel configuration and settings</span>
                    </li>
                  </ul>

                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>Important:</strong> Posts already published on {deletingChannel?.provider}{' '}
                      will NOT be deleted. You'll need to delete them directly on the platform.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loadingImpact}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}