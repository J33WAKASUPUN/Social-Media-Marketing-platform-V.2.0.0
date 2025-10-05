import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Eye,
  MousePointer,
  Share2,
  Heart,
  Calendar,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { mockAnalytics, mockPosts } from '@/data/mockData';

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('engagement');

  // Calculate overview metrics
  const totalEngagement = mockAnalytics.reduce((sum, day) => sum + day.totalEngagement, 0);
  const totalReach = mockAnalytics.reduce((sum, day) => sum + day.reach, 0);
  const totalImpressions = mockAnalytics.reduce((sum, day) => sum + day.impressions, 0);
  const avgEngagementRate = mockAnalytics.reduce((sum, day) => sum + day.engagementRate, 0) / mockAnalytics.length;
  const totalFollowerGrowth = mockAnalytics.reduce((sum, day) => sum + day.followerGrowth, 0);

  const overviewCards = [
    {
      title: 'Total Reach',
      value: totalReach.toLocaleString(),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Eye,
      description: 'Unique accounts reached',
    },
    {
      title: 'Total Engagement',
      value: totalEngagement.toLocaleString(),
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: MessageSquare,
      description: 'Likes, comments, shares',
    },
    {
      title: 'Engagement Rate',
      value: `${avgEngagementRate.toFixed(1)}%`,
      change: '-0.3%',
      changeType: 'negative' as const,
      icon: TrendingUp,
      description: 'Average engagement rate',
    },
    {
      title: 'Follower Growth',
      value: `+${totalFollowerGrowth}`,
      change: '+18.7%',
      changeType: 'positive' as const,
      icon: Users,
      description: 'New followers this period',
    },
  ];

  // Platform performance data
  const platformData = [
    { name: 'Instagram', engagement: 4250, reach: 18500, posts: 12, color: '#E4405F' },
    { name: 'Facebook', engagement: 2800, reach: 22100, posts: 8, color: '#1877F2' },
    { name: 'Twitter', engagement: 1950, reach: 15200, posts: 15, color: '#1DA1F2' },
    { name: 'LinkedIn', engagement: 1420, reach: 8900, posts: 6, color: '#0A66C2' },
  ];

  // Engagement over time data
  const engagementData = mockAnalytics.map(day => ({
    date: new Date(day.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    engagement: day.totalEngagement,
    reach: day.reach,
    impressions: day.impressions,
    posts: day.totalPosts,
  }));

  // Top performing posts
  const topPosts = mockPosts
    .filter(post => post.status === 'published')
    .sort((a, b) => {
      const aTotal = a.engagement.likes + a.engagement.comments + a.engagement.shares;
      const bTotal = b.engagement.likes + b.engagement.comments + b.engagement.shares;
      return bTotal - aTotal;
    })
    .slice(0, 5);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your social media performance and discover insights.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card) => (
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
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {card.change}
                </div>
                <span className="text-xs text-muted-foreground">{card.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Engagement Over Time</CardTitle>
            <CardDescription>
              Track your engagement trends across all platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="reach">Reach</TabsTrigger>
                <TabsTrigger value="impressions">Impressions</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
              </TabsList>
              
              <div className="mt-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Platform Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>
              Engagement by platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="engagement"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3 mt-4">
              {platformData.map((platform) => (
                <div key={platform.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: platform.color }}
                    />
                    <span className="text-sm font-medium">{platform.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {platform.engagement.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Comparison</CardTitle>
            <CardDescription>
              Compare reach and engagement across platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={4} />
                  <Bar dataKey="reach" fill="hsl(var(--primary))" fillOpacity={0.6} radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <CardDescription>
              Your best content from the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPosts.map((post, index) => {
                const totalEngagement = post.engagement.likes + post.engagement.comments + post.engagement.shares;
                return (
                  <div key={post.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2 mb-2">{post.content}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{post.engagement.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{post.engagement.comments}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Share2 className="w-3 h-3" />
                          <span>{post.engagement.shares}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{totalEngagement}</div>
                      <div className="text-xs text-muted-foreground">total</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;