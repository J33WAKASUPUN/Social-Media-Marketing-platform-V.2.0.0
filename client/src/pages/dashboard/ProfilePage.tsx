import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { mockData } from '@/data/mockData';
import { 
  User, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  MessageSquare, 
  Heart, 
  Share2, 
  Eye,
  Target,
  Clock,
  Award,
  Activity,
  CheckCircle2
} from 'lucide-react';

const ProfilePage = () => {
  const currentUser = mockData.team.find(member => member.id === '1');
  const userPosts = mockData.posts.filter(post => post.author.id === '1');
  const userStats = mockData.analytics;

  // Calculate user-specific metrics
  const totalPosts = userPosts.length;
  const publishedPosts = userPosts.filter(post => post.status === 'published').length;
  const scheduledPosts = userPosts.filter(post => post.status === 'scheduled').length;
  const draftPosts = userPosts.filter(post => post.status === 'draft').length;

  // Calculate engagement metrics
  const totalEngagements = userPosts.reduce((total, post) => {
    return total + (post.engagement?.likes || 0) + (post.engagement?.comments || 0) + (post.engagement?.shares || 0);
  }, 0);

  const averageEngagement = totalPosts > 0 ? Math.round(totalEngagements / totalPosts) : 0;

  const achievements = [
    { id: 1, title: 'First Post', description: 'Published your first social media post', earned: true, date: '2024-01-01' },
    { id: 2, title: 'Engagement Master', description: 'Reached 1000+ total engagements', earned: true, date: '2024-01-10' },
    { id: 3, title: 'Consistent Creator', description: 'Posted for 7 consecutive days', earned: true, date: '2024-01-08' },
    { id: 4, title: 'Viral Content', description: 'Created a post with 100+ shares', earned: false, date: null },
    { id: 5, title: 'Team Player', description: 'Collaborated on 10+ team posts', earned: false, date: null },
    { id: 6, title: 'Analytics Pro', description: 'Viewed analytics 50+ times', earned: true, date: '2024-01-12' }
  ];

  const recentActivity = [
    { action: 'Published post on Instagram', time: '2 hours ago', type: 'post' },
    { action: 'Scheduled 3 posts for next week', time: '5 hours ago', type: 'schedule' },
    { action: 'Received 50+ likes on LinkedIn post', time: '1 day ago', type: 'engagement' },
    { action: 'Added new social account', time: '2 days ago', type: 'account' },
    { action: 'Achieved "Engagement Master" badge', time: '3 days ago', type: 'achievement' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Your social media management journey</p>
        </div>
        
        <Button variant="outline">
          <User className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback className="text-2xl">
                {currentUser?.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{currentUser?.name}</h2>
                <p className="text-muted-foreground">{currentUser?.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge variant="default" className="capitalize">
                    {currentUser?.role}
                  </Badge>
                  <Badge variant="outline">
                    Member since Jan 2024
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{totalPosts}</p>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{publishedPosts}</p>
                  <p className="text-sm text-muted-foreground">Published</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{averageEngagement}</p>
                  <p className="text-sm text-muted-foreground">Avg Engagement</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{achievements.filter(a => a.earned).length}</p>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">My Posts</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Post Engagement Rate</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Content Quality Score</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Publishing Consistency</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Team Collaboration</span>
                    <span className="text-sm font-medium">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Goals & Targets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Goals & Targets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Monthly Posts</span>
                    <span className="text-sm text-muted-foreground">{publishedPosts}/30</span>
                  </div>
                  <Progress value={(publishedPosts / 30) * 100} className="h-2" />
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Engagement Goal</span>
                    <span className="text-sm text-muted-foreground">{totalEngagements}/1500</span>
                  </div>
                  <Progress value={(totalEngagements / 1500) * 100} className="h-2" />
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Platform Coverage</span>
                    <span className="text-sm text-muted-foreground">4/5 platforms</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold">{publishedPosts}</p>
                <p className="text-sm text-muted-foreground">Published Posts</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold">{scheduledPosts}</p>
                <p className="text-sm text-muted-foreground">Scheduled Posts</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-2xl font-bold">{draftPosts}</p>
                <p className="text-sm text-muted-foreground">Draft Posts</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userPosts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{post.platforms.join(', ')}</span>
                        <span>•</span>
                        <span>{post.status}</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      {post.engagement && (
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs">
                            <Heart className="h-3 w-3" />
                            {post.engagement.likes}
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <MessageSquare className="h-3 w-3" />
                            {post.engagement.comments}
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Share2 className="h-3 w-3" />
                            {post.engagement.shares}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.earned ? 'border-primary/50' : 'opacity-60'}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.earned ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.earned && achievement.date && (
                        <p className="text-xs text-primary mt-1">
                          Earned on {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {achievement.earned && (
                      <Award className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      {activity.type === 'post' && <MessageSquare className="h-4 w-4 text-primary" />}
                      {activity.type === 'schedule' && <Calendar className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'engagement' && <Heart className="h-4 w-4 text-red-500" />}
                      {activity.type === 'account' && <User className="h-4 w-4 text-green-600" />}
                      {activity.type === 'achievement' && <Trophy className="h-4 w-4 text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;