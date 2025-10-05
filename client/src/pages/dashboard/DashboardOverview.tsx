import React from 'react';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Calendar,
  PenTool,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { mockActivities, mockPosts, mockSocialAccounts } from '@/data/mockData';

const DashboardOverview = () => {
  // Calculate metrics
  const totalFollowers = mockSocialAccounts.reduce((sum, account) => sum + account.followers, 0);
  const connectedAccounts = mockSocialAccounts.filter(account => account.isConnected).length;
  const publishedPosts = mockPosts.filter(post => post.status === 'published').length;
  const scheduledPosts = mockPosts.filter(post => post.status === 'scheduled').length;
  const totalEngagement = mockPosts.reduce((sum, post) => sum + post.engagement.likes + post.engagement.comments + post.engagement.shares, 0);

  const kpiCards = [
    {
      title: 'Total Followers',
      value: totalFollowers.toLocaleString(),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Users,
      description: 'Across all platforms',
    },
    {
      title: 'Total Engagement',
      value: totalEngagement.toLocaleString(),
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: MessageSquare,
      description: 'This month',
    },
    {
      title: 'Posts Published',
      value: publishedPosts.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: BarChart3,
      description: 'This week',
    },
    {
      title: 'Engagement Rate',
      value: '6.8%',
      change: '-0.3%',
      changeType: 'negative' as const,
      icon: TrendingUp,
      description: 'Average across platforms',
    },
  ];

  const quickActions = [
    {
      title: 'Create Post',
      description: 'Compose and schedule new content',
      icon: PenTool,
      href: '/dashboard/compose',
      variant: 'default' as const,
    },
    {
      title: 'View Calendar',
      description: 'Manage your content schedule',
      icon: Calendar,
      href: '/dashboard/calendar',
      variant: 'outline' as const,
    },
    {
      title: 'Analytics Report',
      description: 'View detailed insights',
      icon: BarChart3,
      href: '/dashboard/analytics',
      variant: 'outline' as const,
    },
  ];

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your social media accounts.
          </p>
        </div>
        <Button className="btn-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <Card key={card.title} className="glass border-border/50 hover:shadow-glass transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{card.value}</div>
              <div className="flex items-center space-x-2">
                <div className={`flex items-center text-sm ${
                  card.changeType === 'positive' ? 'text-success' : 'text-destructive'
                }`}>
                  {card.changeType === 'positive' ? (
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                  )}
                  {card.change}
                </div>
                <span className="text-xs text-muted-foreground">{card.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Jump straight into your most common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant={action.variant}
                size="lg"
                className="w-full justify-start h-auto p-4"
                asChild
              >
                <Link to={action.href}>
                  <action.icon className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-muted-foreground">{action.description}</div>
                  </div>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Connected Accounts Status */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>
              {connectedAccounts} of {mockSocialAccounts.length} accounts connected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={(connectedAccounts / mockSocialAccounts.length) * 100} className="h-2" />
            
            <div className="space-y-3">
              {mockSocialAccounts.slice(0, 4).map((account) => (
                <div key={account.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={account.avatar} alt={account.platform} />
                      <AvatarFallback className={`platform-${account.platform}`}>
                        {account.platform.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{account.displayName}</div>
                      <div className="text-xs text-muted-foreground">
                        {account.followers.toLocaleString()} followers
                      </div>
                    </div>
                  </div>
                  <Badge variant={account.isConnected ? 'default' : 'secondary'}>
                    {account.isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/dashboard/accounts">
                Manage All Accounts
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Scheduled Posts */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Posts</CardTitle>
            <CardDescription>
              {scheduledPosts} posts scheduled for the next 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockPosts
              .filter(post => post.status === 'scheduled')
              .slice(0, 3)
              .map((post) => (
                <div key={post.id} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    {post.platforms.map((platform) => (
                      <Badge key={platform} variant="outline" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm line-clamp-2">{post.content}</p>
                  <div className="text-xs text-muted-foreground">
                    Scheduled: {post.scheduledFor ? formatTimestamp(post.scheduledFor) : 'Not scheduled'}
                  </div>
                </div>
              ))}
            
            {scheduledPosts === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No upcoming posts</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link to="/dashboard/compose">Schedule a Post</Link>
                </Button>
              </div>
            )}

            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link to="/dashboard/calendar">
                View Full Calendar
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates from your team and accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockActivities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b last:border-0">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                  <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user.name}</span> {activity.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" size="sm" className="w-full mt-4" asChild>
            <Link to="/dashboard/notifications">
              View All Activity
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;