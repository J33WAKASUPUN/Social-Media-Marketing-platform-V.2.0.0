export type Platform = 'linkedin' | 'facebook' | 'instagram' | 'twitter' | 'youtube';

export interface PlatformCapability {
  provider: Platform;
  displayName: string;
  supports: {
    text: boolean;
    images: boolean;
    videos: boolean;
    multipleImages: boolean;
    update: boolean;
    delete: boolean;
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
      update: true,
      delete: true,
    },
    limits: {
      maxTextLength: 3000,
      maxImages: 9,
      maxVideos: 1,
      maxVideoSize: '200MB',
      videoDuration: '10 minutes',
    },
    warnings: [
      '✅ Full support for text, images, and videos',
      '✅ Can update and delete posts',
      '⚠️ Videos limited to 10 minutes',
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
      update: true, // Limited - only text
      delete: true,
    },
    limits: {
      maxTextLength: 63206,
      maxImages: 10,
      maxVideos: 1,
      maxVideoSize: '10GB',
    },
    warnings: [
      '✅ Full support for text, images, and videos',
      '⚠️ Can only update text, not media',
      '✅ Can delete posts',
    ],
  },

  instagram: {
    provider: 'instagram',
    displayName: 'Instagram',
    supports: {
      text: true,
      images: true,
      videos: true,
      multipleImages: true,
      update: false, // ❌ NO UPDATE
      delete: true,
    },
    limits: {
      maxTextLength: 2200,
      maxImages: 10,
      maxVideos: 1,
      maxVideoSize: '100MB',
      videoDuration: '60 seconds (Reels) or 60 minutes',
    },
    warnings: [
      '✅ Supports images and videos',
      '❌ CANNOT update posts after publishing',
      '✅ Can delete posts',
      '⚠️ Videos under 60s = Reels, longer = Feed post',
    ],
  },

  twitter: {
    provider: 'twitter',
    displayName: 'Twitter (X)',
    supports: {
      text: true,
      images: false, // ❌ NOT IMPLEMENTED
      videos: false, // ❌ NOT IMPLEMENTED
      multipleImages: false,
      update: false, // ❌ NO UPDATE
      delete: false, // ❌ NO DELETE (API limitation)
    },
    limits: {
      maxTextLength: 280,
      maxImages: 0,
      maxVideos: 0,
      maxVideoSize: 'N/A',
    },
    warnings: [
      '⚠️ TEXT ONLY - No images or videos',
      '❌ CANNOT update tweets',
      '❌ CANNOT delete tweets (API limitation)',
      '⚠️ Free API tier: 17 tweets per 24 hours',
    ],
  },

  youtube: {
    provider: 'youtube',
    displayName: 'YouTube',
    supports: {
      text: true, // Title + Description
      images: false,
      videos: true,
      multipleImages: false,
      update: true, // Can update title, description, privacy
      delete: true,
    },
    limits: {
      maxTextLength: 5000, // Description
      maxImages: 0,
      maxVideos: 1,
      maxVideoSize: '256GB',
      videoDuration: 'Up to 12 hours',
    },
    warnings: [
      '✅ VIDEO UPLOADS ONLY',
      '✅ Can update title, description, and privacy',
      '✅ Can delete videos',
      '⚠️ Shorts: Max 60 seconds, vertical (9:16)',
      '⚠️ Regular videos: Any length, any aspect ratio',
    ],
  },
};

/**
 * Get capabilities for a specific platform
 */
export function getPlatformCapability(provider: Platform): PlatformCapability {
  return PLATFORM_CAPABILITIES[provider];
}

/**
 * Check if platform supports a specific feature
 */
export function platformSupports(provider: Platform, feature: keyof PlatformCapability['supports']): boolean {
  return PLATFORM_CAPABILITIES[provider]?.supports[feature] || false;
}

/**
 * Get max character limit for platform
 */
export function getMaxCharLimit(providers: Platform[]): number {
  if (providers.length === 0) return 3000;
  
  const limits = providers.map(p => PLATFORM_CAPABILITIES[p].limits.maxTextLength);
  return Math.min(...limits); // Use strictest limit
}

/**
 * Check if any selected platform has limitations
 */
export function hasAnyLimitations(providers: Platform[]): boolean {
  return providers.some(p => 
    PLATFORM_CAPABILITIES[p].warnings.some(w => w.includes('❌') || w.includes('⚠️'))
  );
}

/**
 * Get aggregated warnings for selected platforms
 */
export function getAggregatedWarnings(providers: Platform[]): string[] {
  const warnings = new Set<string>();
  
  providers.forEach(provider => {
    PLATFORM_CAPABILITIES[provider].warnings.forEach(w => warnings.add(w));
  });
  
  return Array.from(warnings);
}