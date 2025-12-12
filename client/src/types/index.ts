export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  provider: 'local' | 'google';
  hasPassword?: boolean;
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
  role?: 'owner' | 'manager' | 'editor' | 'viewer';
  permissions?: string[]; 
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

export type PlatformType = 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'whatsapp';

// WhatsApp Channel interface
export interface WhatsAppChannel extends Channel {
  provider: 'whatsapp';
  providerData: {
    businessAccountId: string;
    phoneNumberId: string;
    qualityRating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
  };
}

// WhatsApp Contact interface
export interface WhatsAppContact {
  _id: string;
  brand: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  groups: string[];
  customFields?: Record<string, string>;
  optedIn: boolean;
  optedInAt?: string;
  optedOutAt?: string;
  lastMessageSentAt?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// WhatsApp Message interface
export interface WhatsAppMessage {
  _id: string;
  messageId: string;
  brand?: string;
  channel?: string;
  from: string;
  to: string;
  phoneNumberId: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'template' | 'interactive' | 'call';
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'received';
  content: {
    text?: string;
    image?: {
      id: string;
      mime_type?: string;
      sha256?: string;
      caption?: string;
    };
    video?: {
      id: string;
      mime_type?: string;
      sha256?: string;
      caption?: string;
    };
    audio?: {
      id: string;
      mime_type?: string;
      sha256?: string;
    };
    document?: {
      id: string;
      filename?: string;
      mime_type?: string;
      sha256?: string;
      caption?: string;
    };
    template?: {
      name: string;
      language: string;
      components?: any[];
    };
    call?: {
      callId: string;
      duration?: number;
      callStatus: 'missed' | 'rejected' | 'accepted' | 'no_answer';
      videoCall: boolean;
    };
  };
  timestamp: string;
  lastStatusUpdate?: string;
  errors?: Array<{
    code: number;
    title: string;
    message: string;
    error_data?: any;
  }>;
  metadata?: {
    displayPhoneNumber?: string;
    phoneNumberId?: string;
    contactName?: string;
    conversationId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// WhatsApp Template interface
export interface WhatsAppTemplate {
  _id: string;
  brand: string;
  channel: string;
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  components: Array<{
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    text?: string;
    example?: any;
    buttons?: Array<{
      type: string;
      text: string;
      url?: string;
      phone_number?: string;
    }>;
  }>;
  platformTemplateId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// WhatsApp Account Health interface
export interface WhatsAppAccountHealth {
  _id: string;
  channel: string;
  phoneNumberId: string;
  qualityRating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
  messagingLimit: 'TIER_NOT_SET' | 'TIER_50' | 'TIER_250' | 'TIER_1K' | 'TIER_10K' | 'TIER_100K' | 'TIER_UNLIMITED';
  qualityScore?: number;
  lastUpdated: string;
  history: Array<{
    qualityRating: string;
    messagingLimit?: string;
    timestamp: string;
    reason?: string;
  }>;
  alerts: Array<{
    type: 'QUALITY_DEGRADED' | 'LIMIT_REACHED' | 'ACCOUNT_RESTRICTED';
    message: string;
    severity: 'info' | 'warning' | 'critical';
    acknowledged: boolean;
    acknowledgedBy?: string;
    createdAt: string;
  }>;
}

export interface Channel {
  _id?: string;
  id: string;
  brand: string;
  provider: PlatformType;
  platformUserId: string;
  platformUsername?: string;
  displayName: string;
  avatar?: string;
  profileUrl?: string;
  connectionStatus: 'active' | 'expired' | 'error' | 'disconnected';
  lastHealthCheck?: string;
  healthCheckError?: string;
  providerData?: {
    // Platform-specific data
    followers?: number;
    subscribers?: number;
    videoCount?: number;
    viewCount?: number;
    mediaCount?: number;
    tasks?: string[];
    category?: string;
    [key: string]: any;
  };
  connectedAt: string;
  connectedBy: string;
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
  hashtags?: string[];
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
  brand: string;
  uploadedBy: string | User;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  s3Url: string;
  s3Bucket: string;
  type: 'image' | 'video' | 'document';
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    aspectRatio?: string;
    format?: string;
    thumbnailUrl?: string;
  };
  folder: string;
  tags: string[];
  altText?: string;
  caption?: string;
  usageCount: number;
  lastUsedAt?: string;
  usedInPosts: string[];
  status: 'active' | 'archived' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export interface MediaStats {
  totalFiles: number;
  totalSize: number;
  totalSizeFormatted: string;
  byType: Array<{
    type: string;
    count: number;
    size: number;
    sizeFormatted: string;
  }>;
}

export interface FolderMetadata {
  name: string;
  description?: string;
  color?: string;
  mediaCount: number;
  totalSize: number;
  totalSizeFormatted: string;
  lastUpdated: string;
  createdAt?: string;
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
    totalPages: number;
    totalItems: number;
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