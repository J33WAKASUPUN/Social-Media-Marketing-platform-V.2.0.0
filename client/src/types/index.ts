export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  provider: 'local' | 'google';
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  owner: string | User;
  settings?: {
    timezone?: string;
    features?: {
      analytics?: boolean;
      scheduling?: boolean;
      teamCollaboration?: boolean;
    };
  };
  subscription?: {
    tier?: 'free' | 'pro' | 'enterprise';
    status?: 'active' | 'suspended' | 'cancelled';
    validUntil?: string;
  };
  status?: 'active' | 'suspended' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  organization: string | Organization;
  connectedPlatforms?: string[];
  channelCount?: number;
  settings?: {
    timezone?: string;
    defaultPostingTime?: {
      hour: number;
      minute: number;
    };
    requireApproval?: boolean;
    allowedPlatforms?: string[];
  };
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
  status?: 'active' | 'archived' | 'deleted';
  role?: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export type PlatformType = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube';

export interface Channel {
  _id: string;
  platform: PlatformType;
  platformAccountId: string;
  platformUsername: string;
  platformName: string;
  profilePicture?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: string;
  isActive: boolean;
  brand: string | Brand;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface PostContent {
  text: string;
  mediaUrls?: string[];
  link?: string;
}

export interface PlatformSpecificContent {
  platform: PlatformType;
  content: PostContent;
  customizations?: {
    firstComment?: string;
    hashtags?: string[];
    mentions?: string[];
    location?: string;
    isThread?: boolean;
    threadPosts?: string[];
  };
}

export interface Post {
  _id: string;
  brand: string | Brand;
  status: PostStatus;
  scheduledFor?: string;
  publishedAt?: string;
  content: PostContent;
  platformSpecificContent?: PlatformSpecificContent[];
  selectedChannels: (string | Channel)[];
  media?: (string | Media)[];
  createdBy: string | User;
  lastModifiedBy?: string | User;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublishedPost {
  _id: string;
  post: string | Post;
  channel: string | Channel;
  platformPostId: string;
  platformPostUrl?: string;
  publishedAt: string;
  analytics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    clicks?: number;
    impressions?: number;
    reach?: number;
    engagement?: number;
    lastFetchedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  provider: 'cloudinary' | 's3';
  providerId?: string;
  brand?: string | Brand;
  organization: string | Organization;
  uploadedBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export type MemberRole = 'owner' | 'manager' | 'editor' | 'viewer';

export interface Membership {
  _id: string;
  organization: string | Organization;
  brand?: string | Brand;
  user: string | User;
  role: MemberRole;
  permissions?: string[];
  invitedBy?: string | User;
  invitedAt?: string;
  acceptedAt?: string;
  status?: 'pending' | 'active' | 'suspended';
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 
  | 'post_published' 
  | 'post_failed' 
  | 'channel_disconnected' 
  | 'team_invitation' 
  | 'daily_summary';

export interface Notification {
  _id: string;
  user: string | User;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  failedPosts: number;
  totalEngagement: number;
  totalReach: number;
  totalImpressions: number;
  platformBreakdown: {
    platform: PlatformType;
    posts: number;
    engagement: number;
    reach: number;
  }[];
  topPosts: PublishedPost[];
  engagementTrend: {
    date: string;
    engagement: number;
    reach: number;
    impressions: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}