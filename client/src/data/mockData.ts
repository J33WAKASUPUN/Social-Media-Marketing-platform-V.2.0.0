// Mock data for the social media marketing platform

export interface SocialAccount {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok';
  username: string;
  displayName: string;
  avatar: string;
  followers: number;
  isConnected: boolean;
  lastSync: string;
  profileUrl: string;
}

export interface Post {
  id: string;
  content: string;
  platforms: string[];
  status: 'published' | 'scheduled' | 'draft' | 'failed';
  publishedAt?: string;
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
  mediaUrls?: string[];
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    clicks?: number;
  };
  author: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface AnalyticsData {
  period: string;
  totalPosts: number;
  totalEngagement: number;
  reach: number;
  impressions: number;
  clickThroughRate: number;
  engagementRate: number;
  followerGrowth: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'manager' | 'editor' | 'viewer';
  lastActive: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface Activity {
  id: string;
  type: 'post_published' | 'post_scheduled' | 'account_connected' | 'team_member_added' | 'analytics_milestone';
  message: string;
  timestamp: string;
  user: {
    name: string;
    avatar: string;
  };
  metadata?: any;
}

export const mockSocialAccounts: SocialAccount[] = [
  {
    id: '1',
    platform: 'facebook',
    username: '@creativeagency',
    displayName: 'Creative Agency Co.',
    avatar: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=150&h=150&fit=crop',
    followers: 25430,
    isConnected: true,
    lastSync: '2024-01-15T10:30:00Z',
    profileUrl: 'https://facebook.com/creativeagency',
  },
  {
    id: '2',
    platform: 'instagram',
    username: '@creative.agency',
    displayName: 'Creative Agency Co.',
    avatar: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=150&h=150&fit=crop',
    followers: 18650,
    isConnected: true,
    lastSync: '2024-01-15T10:25:00Z',
    profileUrl: 'https://instagram.com/creative.agency',
  },
  {
    id: '3',
    platform: 'twitter',
    username: '@CreativeAgency',
    displayName: 'Creative Agency Co.',
    avatar: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=150&h=150&fit=crop',
    followers: 12800,
    isConnected: true,
    lastSync: '2024-01-15T10:20:00Z',
    profileUrl: 'https://twitter.com/CreativeAgency',
  },
  {
    id: '4',
    platform: 'linkedin',
    username: 'creative-agency-co',
    displayName: 'Creative Agency Co.',
    avatar: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=150&h=150&fit=crop',
    followers: 5420,
    isConnected: true,
    lastSync: '2024-01-15T10:15:00Z',
    profileUrl: 'https://linkedin.com/company/creative-agency-co',
  },
  {
    id: '5',
    platform: 'youtube',
    username: 'CreativeAgencyCo',
    displayName: 'Creative Agency Co.',
    avatar: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=150&h=150&fit=crop',
    followers: 8920,
    isConnected: false,
    lastSync: '2024-01-10T15:00:00Z',
    profileUrl: 'https://youtube.com/@CreativeAgencyCo',
  },
  {
    id: '6',
    platform: 'tiktok',
    username: '@creativeagency',
    displayName: 'Creative Agency Co.',
    avatar: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=150&h=150&fit=crop',
    followers: 15200,
    isConnected: false,
    lastSync: '2024-01-05T12:00:00Z',
    profileUrl: 'https://tiktok.com/@creativeagency',
  },
];

export const mockPosts: Post[] = [
  {
    id: '1',
    content: '🚀 Excited to share our latest design project! This modern brand identity for @TechStartup showcases the power of minimalist design in the digital age. What do you think? #BrandDesign #DesignInspiration #CreativeAgency',
    platforms: ['instagram', 'twitter', 'linkedin'],
    status: 'published',
    publishedAt: '2024-01-15T09:00:00Z',
    createdAt: '2024-01-14T15:30:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    mediaUrls: ['https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=800&fit=crop'],
    engagement: {
      likes: 342,
      comments: 28,
      shares: 15,
      clicks: 89,
    },
    author: {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
  },
  {
    id: '2',
    content: 'Behind the scenes of our creative process 📸 From concept to final execution, every detail matters. Our team brings passion and precision to every project. #BehindTheScenes #CreativeProcess #TeamWork',
    platforms: ['instagram', 'facebook'],
    status: 'scheduled',
    scheduledFor: '2024-01-16T14:00:00Z',
    createdAt: '2024-01-15T11:20:00Z',
    updatedAt: '2024-01-15T11:20:00Z',
    mediaUrls: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=800&fit=crop'],
    engagement: {
      likes: 0,
      comments: 0,
      shares: 0,
    },
    author: {
      id: '2',
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
  },
  {
    id: '3',
    content: 'Draft: New website launch for innovative fintech startup. Revolutionary approach to digital banking. Coming soon!',
    platforms: ['linkedin', 'twitter'],
    status: 'draft',
    createdAt: '2024-01-15T16:45:00Z',
    updatedAt: '2024-01-15T16:45:00Z',
    engagement: {
      likes: 0,
      comments: 0,
      shares: 0,
    },
    author: {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
  },
];

export const mockAnalytics: AnalyticsData[] = [
  { period: '2024-01-01', totalPosts: 12, totalEngagement: 2840, reach: 18500, impressions: 45200, clickThroughRate: 3.2, engagementRate: 6.3, followerGrowth: 145 },
  { period: '2024-01-02', totalPosts: 8, totalEngagement: 1950, reach: 15200, impressions: 38900, clickThroughRate: 2.8, engagementRate: 5.1, followerGrowth: 89 },
  { period: '2024-01-03', totalPosts: 15, totalEngagement: 3420, reach: 22100, impressions: 52300, clickThroughRate: 4.1, engagementRate: 7.8, followerGrowth: 203 },
  { period: '2024-01-04', totalPosts: 10, totalEngagement: 2180, reach: 16800, impressions: 41200, clickThroughRate: 3.0, engagementRate: 5.9, followerGrowth: 112 },
  { period: '2024-01-05', totalPosts: 18, totalEngagement: 4260, reach: 26500, impressions: 58100, clickThroughRate: 4.8, engagementRate: 8.9, followerGrowth: 287 },
  { period: '2024-01-06', totalPosts: 6, totalEngagement: 1420, reach: 12100, impressions: 29800, clickThroughRate: 2.3, engagementRate: 4.2, followerGrowth: 67 },
  { period: '2024-01-07', totalPosts: 14, totalEngagement: 3180, reach: 20400, impressions: 48600, clickThroughRate: 3.8, engagementRate: 7.1, followerGrowth: 176 },
];

export const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    role: 'owner',
    lastActive: '2024-01-15T10:30:00Z',
    status: 'active',
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@company.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'manager',
    lastActive: '2024-01-15T09:45:00Z',
    status: 'active',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily@company.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    role: 'editor',
    lastActive: '2024-01-14T16:20:00Z',
    status: 'active',
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david@company.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    role: 'viewer',
    lastActive: '2024-01-13T11:15:00Z',
    status: 'inactive',
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'post_published',
    message: 'Published a new post to Instagram, Twitter, and LinkedIn',
    timestamp: '2024-01-15T09:00:00Z',
    user: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
    metadata: { postId: '1', platforms: ['instagram', 'twitter', 'linkedin'] },
  },
  {
    id: '2',
    type: 'post_scheduled',
    message: 'Scheduled a post for tomorrow at 2:00 PM',
    timestamp: '2024-01-15T11:20:00Z',
    user: {
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
    metadata: { postId: '2', scheduledFor: '2024-01-16T14:00:00Z' },
  },
  {
    id: '3',
    type: 'analytics_milestone',
    message: 'Reached 25,000 followers on Facebook! 🎉',
    timestamp: '2024-01-14T15:30:00Z',
    user: {
      name: 'System',
      avatar: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=150&h=150&fit=crop',
    },
    metadata: { platform: 'facebook', milestone: 25000 },
  },
  {
    id: '4',
    type: 'team_member_added',
    message: 'Added Emily Rodriguez as an editor',
    timestamp: '2024-01-13T10:00:00Z',
    user: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
    metadata: { memberId: '3', role: 'editor' },
  },
  {
    id: '5',
    type: 'account_connected',
    message: 'Connected new Instagram account @creative.agency',
    timestamp: '2024-01-12T14:20:00Z',
    user: {
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
    metadata: { platform: 'instagram', accountId: '2' },
  },
];

export const getPlatformColor = (platform: string): string => {
  const colors: Record<string, string> = {
    facebook: '#1877F2',
    instagram: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
    youtube: '#FF0000',
    tiktok: '#000000',
  };
  return colors[platform] || '#6B7280';
};

export const getPlatformIcon = (platform: string): string => {
  return platform.charAt(0).toUpperCase() + platform.slice(1);
};

// Centralized mock data object
export const mockData = {
  accounts: mockSocialAccounts,
  posts: mockPosts,
  team: mockTeamMembers,
  analytics: mockAnalytics
};