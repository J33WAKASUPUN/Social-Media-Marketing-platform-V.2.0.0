import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export type TourId = 'welcome' | 'settings';

const TOUR_STORAGE_KEY = 'socialflow_completed_tours';
const NEW_USER_KEY = 'socialflow_is_new_user';

export const isTourCompleted = (tourId: TourId): boolean => {
  const completed = localStorage.getItem(TOUR_STORAGE_KEY);
  if (!completed) return false;
  return JSON.parse(completed).includes(tourId);
};

export const markTourCompleted = (tourId: TourId): void => {
  const completed = localStorage.getItem(TOUR_STORAGE_KEY);
  const tours = completed ? JSON.parse(completed) : [];
  if (!tours.includes(tourId)) {
    tours.push(tourId);
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(tours));
  }
};

export const resetAllTours = (): void => {
  localStorage.removeItem(TOUR_STORAGE_KEY);
  localStorage.removeItem(NEW_USER_KEY);
};

export const isNewUser = (): boolean => {
  return !localStorage.getItem(NEW_USER_KEY);
};

export const markUserAsReturning = (): void => {
  localStorage.setItem(NEW_USER_KEY, 'false');
};

interface TourStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side: 'left' | 'right' | 'top' | 'bottom';
    align: 'start' | 'center' | 'end';
  };
  requiredPermission?: 'canConnectChannels' | 'canViewMedia' | 'canViewAnalytics' | 'canViewPosts' | 'canCreatePosts' | 'isManager' | null;
  // ✅ NEW: Special handling for collapsible menus
  onBeforeHighlight?: () => void;
}

const allWelcomeTourSteps: TourStep[] = [
  {
    element: '[data-tour="sidebar"]',
    popover: {
      title: '📍 Navigation Sidebar',
      description: '<p>This is your main navigation. Access all features from here based on your role.</p>',
      side: 'right',
      align: 'start',
    },
    requiredPermission: null,
  },
  {
    element: '[data-tour="menu-dashboard"]',
    popover: {
      title: '🏠 Dashboard',
      description: '<p>Your overview page with stats, quick actions, and upcoming posts.</p>',
      side: 'right',
      align: 'start',
    },
    requiredPermission: null,
  },
  {
    element: '[data-tour="menu-posts"]',
    popover: {
      title: '📝 Submission History',
      description: '<p>View all your posts - drafts, scheduled, published, and failed.</p>',
      side: 'right',
      align: 'start',
    },
    requiredPermission: 'canViewPosts',
  },
  {
    element: '[data-tour="menu-calendar"]',
    popover: {
      title: '📅 Calendar',
      description: '<p>See your content schedule in a calendar view.</p>',
      side: 'right',
      align: 'start',
    },
    requiredPermission: 'canViewPosts',
  },
  {
    element: '[data-tour="menu-analytics"]',
    popover: {
      title: '📊 Analytics',
      description: '<p>Track your posting performance and engagement metrics.</p>',
      side: 'right',
      align: 'start',
    },
    requiredPermission: 'canViewAnalytics',
  },
  {
    element: '[data-tour="menu-channels"]',
    popover: {
      title: '🔗 Channels',
      description: '<p>Connect and manage your social media accounts.</p><p><strong>Note:</strong> Only Managers and Owners can connect channels.</p>',
      side: 'right',
      align: 'start',
    },
    requiredPermission: 'canConnectChannels',
  },
  // WhatsApp Step with special handling
  // ❌ DISABLED: WhatsApp Tour Step (Coming in v2.1)
  // {
  //   element: '[data-tour="menu-whatsapp"]',
  //   popover: {
  //     title: '💬 WhatsApp Business',
  //     description: '<p>Manage your WhatsApp Business messaging:</p><ul class="list-disc pl-4 mt-2 space-y-1"><li><strong>Inbox:</strong> Chat with customers</li><li><strong>Templates:</strong> Pre-approved message templates</li><li><strong>Contacts:</strong> Manage customer database</li><li><strong>Call Logs:</strong> Track call history</li></ul>',
  //     side: 'right',
  //     align: 'start',
  //   },
  //   requiredPermission: 'isManager',
  //   // Open the collapsible menu before highlighting
  //   onBeforeHighlight: () => {
  //     const whatsappButton = document.querySelector('[data-tour="menu-whatsapp"]') as HTMLElement;
  //     if (whatsappButton) {
  //       // Check if it's collapsed
  //       const isCollapsed = whatsappButton.getAttribute('data-state') === 'closed';
  //       if (isCollapsed) {
  //         // Click to open
  //         whatsappButton.click();
  //         // Wait for animation
  //         return new Promise(resolve => setTimeout(resolve, 300));
  //       }
  //     }
  //   },
  // },
  {
    element: '[data-tour="menu-media"]',
    popover: {
      title: '🖼️ Media Library',
      description: '<p>Upload and organize your images and videos for posts.</p>',
      side: 'right',
      align: 'start',
    },
    requiredPermission: 'canViewMedia',
  },
  {
    element: '[data-tour="menu-ai-chat"]',
    popover: {
      title: '✨ AI Assistant',
      description: '<p>Chat with AI to:</p><ul class="list-disc pl-4 mt-2 space-y-1"><li>Generate content ideas</li><li>Write social media posts</li><li>Get marketing advice</li><li>Optimize your content strategy</li></ul><p class="mt-2"><strong>Note:</strong> Available to Editors, Managers, and Owners.</p>',
      side: 'right',
      align: 'start',
    },
    requiredPermission: 'canCreatePosts',
  },
  {
    element: '[data-tour="menu-settings"]',
    popover: {
      title: '⚙️ Settings',
      description: '<p>Manage your profile, security, and preferences.</p>',
      side: 'right',
      align: 'start',
    },
    requiredPermission: null,
  },
  {
    element: '[data-tour="organization-selector"]',
    popover: {
      title: '🏢 Organization Selector',
      description: '<p>Switch between organizations you belong to.</p><p>Each organization can have multiple brands.</p>',
      side: 'bottom',
      align: 'start',
    },
    requiredPermission: null,
  },
  {
    element: '[data-tour="brand-selector"]',
    popover: {
      title: '🏷️ Brand Selector',
      description: '<p>Select the brand you want to work with.</p><p>All posts, channels, and analytics are brand-specific.</p>',
      side: 'bottom',
      align: 'start',
    },
    requiredPermission: null,
  },
  {
    element: '[data-tour="notifications"]',
    popover: {
      title: '🔔 Notifications',
      description: '<p>Stay updated with:</p><p>• Post publishing status</p><p>• Channel connection alerts</p><p>• Team invitations</p>',
      side: 'bottom',
      align: 'end',
    },
    requiredPermission: null,
  },
  {
    element: '[data-tour="user-menu"]',
    popover: {
      title: '👤 Your Profile',
      description: '<p>Access your account settings, manage your profile, and log out from here.</p>',
      side: 'left',
      align: 'end',
    },
    requiredPermission: null,
  },
];

export interface UserPermissions {
  canConnectChannels: boolean;
  canViewMedia: boolean;
  canViewAnalytics: boolean;
  canViewPosts: boolean;
  canCreatePosts: boolean;
  isManager: boolean;
  isOwner: boolean;
}

export const startWelcomeTour = (onComplete?: () => void, permissions?: UserPermissions) => {
  const filteredSteps = allWelcomeTourSteps.filter(step => {
    if (!step.requiredPermission) return true;
    if (!permissions) return true;
    
    // Special handling for Manager/Owner only features (WhatsApp)
    if (step.requiredPermission === 'isManager') {
      return permissions.isManager || permissions.isOwner;
    }
    
    return permissions[step.requiredPermission] === true;
  });

  // ✅ Process steps with onBeforeHighlight handlers
  const processedSteps = filteredSteps.map(step => {
    const baseStep = {
      element: step.element,
      popover: step.popover,
    };

    // Add onBeforeHighlighted callback if defined
    if (step.onBeforeHighlight) {
      return {
        ...baseStep,
        onBeforeHighlighted: async (element: Element) => {
          await step.onBeforeHighlight?.();
        },
      };
    }

    return baseStep;
  });

  const stepsWithFinal = [
    ...processedSteps,
    {
      popover: {
        title: '🎉 You\'re All Set!',
        description: '<p>You now know the basics of SocialFlow!</p><p>Start exploring based on your role permissions.</p><p>You can replay this tour anytime from <strong>Settings → Tours</strong>.</p>',
      },
    },
  ];

  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayClickNext: false,
    stagePadding: 10,
    stageRadius: 8,
    popoverClass: 'socialflow-tour-popover',
    steps: stepsWithFinal,
    onDestroyed: () => {
      markTourCompleted('welcome');
      onComplete?.();
    },
  });

  driverObj.drive();
  return driverObj;
};

export const startSettingsTour = (onComplete?: () => void) => {
  const steps = [
    {
      element: '[data-tour="settings-profile"]',
      popover: {
        title: '👤 Profile Settings',
        description: '<p>Update your name, email, and profile picture.</p>',
        side: 'right' as const,
        align: 'start' as const,
      },
    },
    {
      element: '[data-tour="settings-security"]',
      popover: {
        title: '🔒 Security',
        description: '<p>Change your password and manage authentication settings.</p>',
        side: 'right' as const,
        align: 'start' as const,
      },
    },
    {
      element: '[data-tour="settings-appearance"]',
      popover: {
        title: '🎨 Appearance',
        description: '<p>Customize your theme and visual preferences.</p>',
        side: 'right' as const,
        align: 'start' as const,
      },
    },
    {
      element: '[data-tour="settings-organization"]',
      popover: {
        title: '🏢 Organization',
        description: '<p>Manage organization details and settings.</p>',
        side: 'right' as const,
        align: 'start' as const,
      },
    },
    {
      element: '[data-tour="settings-brands"]',
      popover: {
        title: '🏷️ Brands',
        description: '<p>Create and manage brands.</p>',
        side: 'right' as const,
        align: 'start' as const,
      },
    },
    {
      element: '[data-tour="settings-team"]',
      popover: {
        title: '👥 Team',
        description: '<p>Invite members and manage roles.</p>',
        side: 'right' as const,
        align: 'start' as const,
      },
    },
    {
      element: '[data-tour="settings-tours"]',
      popover: {
        title: '🎓 Tours',
        description: '<p>Reset tutorials here.</p>',
        side: 'right' as const,
        align: 'start' as const,
      },
    },
    {
      popover: {
        title: '✅ Settings Tour Complete!',
        description: '<p>You now know where to find all your settings.</p>',
      },
    },
  ];

  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayClickNext: false,
    stagePadding: 10,
    stageRadius: 8,
    popoverClass: 'socialflow-tour-popover',
    steps,
    onDestroyed: () => {
      markTourCompleted('settings');
      onComplete?.();
    },
  });

  driverObj.drive();
  return driverObj;
};