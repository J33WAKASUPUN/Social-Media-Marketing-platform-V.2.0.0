export type Platform = 'linkedin' | 'facebook' | 'instagram' | 'twitter' | 'youtube';

export interface PlatformCapability {
  provider: Platform;
  displayName: string;
  supports: {
    text: boolean;
    images: boolean;
    videos: boolean;
    multipleImages: boolean;
    update: boolean; // ❌ Always false now
    delete: boolean; // ❌ Always false now
  };
  limits: {
    maxTextLength: number;
    maxImages: number;
    maxVideos: number;
    maxVideoSize: string;
    videoDuration?: string;
  };
  warnings: string[];
}

export const PLATFORM_CAPABILITIES: Record<Platform, PlatformCapability> = {
  linkedin: {
    provider: 'linkedin',
    displayName: 'LinkedIn',
    supports: {
      text: true,
      images: true,
      videos: true,
      multipleImages: true,
      update: false, // ❌ Disabled
      delete: false, // ❌ Disabled
    },
    limits: {
      maxTextLength: 3000,
      maxImages: 9,
      maxVideos: 1,
      maxVideoSize: '200MB',
      videoDuration: '10 minutes',
    },
    warnings: [
      '⚠️ To edit or delete this post, visit LinkedIn directly',
      '✅ Full support for text, images, and videos',
    ],
  },

  facebook: {
    provider: 'facebook',
    displayName: 'Facebook',
    supports: {
      text: true,
      images: true,
      videos: true,
      multipleImages: true,
      update: false, // ❌ Disabled
      delete: false, // ❌ Disabled
    },
    limits: {
      maxTextLength: 63206,
      maxImages: 10,
      maxVideos: 1,
      maxVideoSize: '4GB',
      videoDuration: '240 minutes',
    },
    warnings: [
      '⚠️ To edit or delete this post, visit Facebook directly',
      '✅ Full support for text, images, and videos',
    ],
  },

  instagram: {
    provider: 'instagram',
    displayName: 'Instagram',
    supports: {
      text: true,
      images: true,
      videos: false, // ❌ Disabled
      multipleImages: true,
      update: false, // ❌ Disabled
      delete: false, // ❌ Disabled
    },
    limits: {
      maxTextLength: 2200,
      maxImages: 10,
      maxVideos: 0,
      maxVideoSize: 'N/A',
      videoDuration: 'N/A',
    },
    warnings: [
      '⚠️ To edit or delete this post, visit Instagram directly',
      '✅ Supports photos and carousels',
    ],
  },

  twitter: {
    provider: 'twitter',
    displayName: 'Twitter (X)',
    supports: {
      text: true,
      images: false,
      videos: false,
      multipleImages: false,
      update: false, // ❌ Disabled
      delete: false, // ❌ Disabled
    },
    limits: {
      maxTextLength: 280,
      maxImages: 0,
      maxVideos: 0,
      maxVideoSize: 'N/A',
    },
    warnings: [
      '⚠️ To edit or delete this tweet, visit Twitter/X directly',
      '⚠️ TEXT ONLY - No images or videos (free API)',
    ],
  },

  youtube: {
    provider: 'youtube',
    displayName: 'YouTube',
    supports: {
      text: true,
      images: false,
      videos: true,
      multipleImages: false,
      update: false, // ❌ Disabled
      delete: false, // ❌ Disabled
    },
    limits: {
      maxTextLength: 5000,
      maxImages: 0,
      maxVideos: 1,
      maxVideoSize: '256GB',
      videoDuration: '12 hours',
    },
    warnings: [
      '⚠️ To edit or delete this video, visit YouTube Studio directly',
      '⚠️ VIDEOS ONLY - YouTube does not support text-only posts',
    ],
  },
};

export function getPlatformCapability(platform: Platform): PlatformCapability {
  return PLATFORM_CAPABILITIES[platform] || PLATFORM_CAPABILITIES.linkedin;
}