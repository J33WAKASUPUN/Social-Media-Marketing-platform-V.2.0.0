import React, { useState } from 'react';
import { 
  Plus, 
  RefreshCw, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink,
  Users,
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { mockSocialAccounts } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const SocialAccounts = () => {
  const [accounts, setAccounts] = useState(mockSocialAccounts);
  const { toast } = useToast();

  const handleConnect = (accountId: string) => {
    setAccounts(prev => prev.map(account => 
      account.id === accountId 
        ? { ...account, isConnected: true, lastSync: new Date().toISOString() }
        : account
    ));
    
    toast({
      title: "Account connected",
      description: "Your social media account has been successfully connected.",
    });
  };

  const handleDisconnect = (accountId: string) => {
    setAccounts(prev => prev.map(account => 
      account.id === accountId 
        ? { ...account, isConnected: false }
        : account
    ));
    
    toast({
      title: "Account disconnected",
      description: "Your social media account has been disconnected.",
      variant: "destructive",
    });
  };

  const handleSync = (accountId: string) => {
    setAccounts(prev => prev.map(account => 
      account.id === accountId 
        ? { ...account, lastSync: new Date().toISOString() }
        : account
    ));
    
    toast({
      title: "Account synced",
      description: "Your account data has been refreshed.",
    });
  };

  const connectedAccounts = accounts.filter(account => account.isConnected);
  const totalFollowers = connectedAccounts.reduce((sum, account) => sum + account.followers, 0);

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      facebook: 'bg-[#1877F2]',
      instagram: 'bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888]',
      twitter: 'bg-[#1DA1F2]',
      linkedin: 'bg-[#0A66C2]',
      youtube: 'bg-[#FF0000]',
      tiktok: 'bg-[#000000]',
    };
    return colors[platform] || 'bg-muted';
  };

  const getLastSyncText = (lastSync: string) => {
    const now = new Date();
    const syncDate = new Date(lastSync);
    const diffInMinutes = Math.floor((now.getTime() - syncDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Social Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Connect and manage your social media accounts. {connectedAccounts.length} of {accounts.length} accounts connected.
          </p>
        </div>
        <Button className="btn-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              of {accounts.length} total platforms
            </p>
            <Progress 
              value={(connectedAccounts.length / accounts.length) * 100} 
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFollowers.toLocaleString()}</div>
            <p className="text-xs text-success">+12.5% this month</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">100%</div>
            <p className="text-xs text-muted-foreground">All accounts healthy</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2m</div>
            <p className="text-xs text-muted-foreground">ago</p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Social Media Accounts</CardTitle>
              <CardDescription>
                Manage connections, sync data, and view account health
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Accounts</TabsTrigger>
              <TabsTrigger value="connected">Connected</TabsTrigger>
              <TabsTrigger value="disconnected">Disconnected</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4 mt-6">
              {accounts.map((account) => (
                <Card key={account.id} className="group hover:shadow-md transition-all duration-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={account.avatar} alt={account.platform} />
                            <AvatarFallback className={getPlatformColor(account.platform)}>
                              {account.platform.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {account.isConnected ? (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background flex items-center justify-center">
                              <CheckCircle className="w-2 h-2 text-success-foreground" />
                            </div>
                          ) : (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-destructive rounded-full border-2 border-background flex items-center justify-center">
                              <AlertTriangle className="w-2 h-2 text-destructive-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold capitalize">{account.platform}</h3>
                            <Badge variant={account.isConnected ? 'default' : 'secondary'}>
                              {account.isConnected ? 'Connected' : 'Disconnected'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{account.displayName}</p>
                          <p className="text-sm text-muted-foreground">{account.username}</p>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {account.followers.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground">followers</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {account.isConnected && (
                          <div className="text-xs text-muted-foreground mr-4">
                            Last sync: {getLastSyncText(account.lastSync)}
                          </div>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Settings className="w-4 h-4 mr-2" />
                              Manage
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <a 
                                href={account.profileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Profile
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSync(account.id)}>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Sync Now
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {account.isConnected ? (
                              <DropdownMenuItem 
                                onClick={() => handleDisconnect(account.id)}
                                className="text-destructive"
                              >
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Disconnect
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleConnect(account.id)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Connect
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {/* Account Stats */}
                    {account.isConnected && (
                      <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-primary">
                            {Math.floor(Math.random() * 1000 + 500)}
                          </div>
                          <p className="text-xs text-muted-foreground">Posts this month</p>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-success">
                            +{Math.floor(Math.random() * 500 + 100)}
                          </div>
                          <p className="text-xs text-muted-foreground">New followers</p>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-warning">
                            {(Math.random() * 5 + 2).toFixed(1)}%
                          </div>
                          <p className="text-xs text-muted-foreground">Engagement rate</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="connected" className="space-y-4 mt-6">
              {connectedAccounts.map((account) => (
                <div key={account.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={account.avatar} alt={account.platform} />
                        <AvatarFallback className={getPlatformColor(account.platform)}>
                          {account.platform.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium capitalize">{account.platform}</p>
                        <p className="text-sm text-muted-foreground">{account.username}</p>
                      </div>
                    </div>
                    <Badge variant="default">Connected</Badge>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="disconnected" className="space-y-4 mt-6">
              {accounts.filter(account => !account.isConnected).map((account) => (
                <div key={account.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={account.avatar} alt={account.platform} />
                        <AvatarFallback className={getPlatformColor(account.platform)}>
                          {account.platform.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium capitalize">{account.platform}</p>
                        <p className="text-sm text-muted-foreground">Not connected</p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleConnect(account.id)}
                      className="btn-gradient"
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialAccounts;