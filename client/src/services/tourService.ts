import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../styles/tour.css';

// Only keep welcome and settings tours
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

// Permission-based step definitions
interface TourStep {
  element: string;
  popover: {
    title: string;
    description: string;
    side: 'left' | 'right' | 'top' | 'bottom';
    align: 'start' | 'center' | 'end';
  };
  // Permission required to show this step (null = always show)
  requiredPermission?: 'canConnectChannels' | 'canViewMedia' | 'canViewAnalytics' | 'canViewPosts' | 'canCreatePosts' | null;
}

// All possible welcome tour steps
const allWelcomeTourSteps: TourStep[] = [
  {
    element: '[data-tour="sidebar"]',
    popover: {
      title: '📍 Navigation Sidebar',
      description: '<p>This is your main navigation. Access all features from here based on your role.</p>',
      side: 'right',
      align: 'start',
    },
    requiredPermission: null, // Always show
  },
  {
    element: '[data-tour="menu-dashboard"]',
    popover: {
      title: '🏠 Dashboard',
      description: '<p>Your overview page with stats, quick actions, and upcoming posts.</p>',
      side: 'right',
      align: 'start',
    },
    requiredPermission: null, // Always show
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
    element: '[data-tour="menu-settings"]',
    popover: {
      title: '⚙️ Settings',
      description: '<p>Manage your profile, security, and preferences.</p>',
      side: 'right',
      align: 'start',
    },
    requiredPermission: null, // Always show
  },
  {
    element: '[data-tour="organization-selector"]',
    popover: {
      title: '🏢 Organization Selector',
      description: '<p>Switch between organizations you belong to.</p><p>Each organization can have multiple brands.</p>',
      side: 'bottom',
      align: 'start',
    },
    requiredPermission: null, // Always show
  },
  {
    element: '[data-tour="brand-selector"]',
    popover: {
      title: '🏷️ Brand Selector',
      description: '<p>Select the brand you want to work with.</p><p>All posts, channels, and analytics are brand-specific.</p>',
      side: 'bottom',
      align: 'start',
    },
    requiredPermission: null, // Always show
  },
  {
    element: '[data-tour="notifications"]',
    popover: {
      title: '🔔 Notifications',
      description: '<p>Stay updated with:</p><p>• Post publishing status</p><p>• Channel connection alerts</p><p>• Team invitations</p>',
      side: 'bottom',
      align: 'end',
    },
    requiredPermission: null, // Always show
  },
  {
    element: '[data-tour="user-menu"]',
    popover: {
      title: '👤 Your Profile',
      description: '<p>Access your account settings, manage your profile, and log out from here.</p>',
      side: 'left',
      align: 'end',
    },
    requiredPermission: null, // Always show
  },
];

// User permissions interface (matches usePermissions hook)
export interface UserPermissions {
  canConnectChannels: boolean;
  canViewMedia: boolean;
  canViewAnalytics: boolean;
  canViewPosts: boolean;
  canCreatePosts: boolean;
}

// Welcome Tour - Permission-aware
export const startWelcomeTour = (onComplete?: () => void, permissions?: UserPermissions) => {
  // Filter steps based on permissions
  const filteredSteps = allWelcomeTourSteps.filter(step => {
    // If no permission required, always include
    if (!step.requiredPermission) return true;
    
    // If permissions object not provided, include all (for owners)
    if (!permissions) return true;
    
    // Check if user has the required permission
    return permissions[step.requiredPermission] === true;
  });

  // Add final step
  const stepsWithFinal = [
    ...filteredSteps.map(step => ({
      element: step.element,
      popover: step.popover,
    })),
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
    onDestroyStarted: () => {
      markTourCompleted('welcome');
      markUserAsReturning();
      if (onComplete) onComplete();
      driverObj.destroy();
    },
  });

  driverObj.drive();
  return driverObj;
};

// Settings Tour (unchanged - settings is available to all users)
export const startSettingsTour = (onComplete?: () => void) => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayClickNext: false,
    stagePadding: 10,
    stageRadius: 8,
    popoverClass: 'socialflow-tour-popover',
    steps: [
      {
        element: '[data-tour="settings-tabs"]',
        popover: {
          title: '⚙️ Settings Tabs',
          description: '<p>Navigate between different settings sections using these tabs.</p>',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="profile-tab"]',
        popover: {
          title: '👤 Profile Settings',
          description: '<p>Update your name, email, avatar, and password here.</p>',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="security-tab"]',
        popover: {
          title: '🔒 Security Settings',
          description: '<p>Enable two-factor authentication (2FA) for extra security.</p>',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="appearance-tab"]',
        popover: {
          title: '🎨 Appearance',
          description: '<p>Switch between light, dark, or system theme.</p>',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="organization-tab"]',
        popover: {
          title: '🏢 Organization Settings',
          description: '<p>Manage your organization details and settings.</p>',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '[data-tour="team-tab"]',
        popover: {
          title: '👥 Team Management',
          description: '<p>Invite team members and manage their roles.</p>',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        popover: {
          title: '✅ Settings Tour Complete!',
          description: '<p>You now know how to customize your SocialFlow experience!</p>',
        },
      },
    ],
    onDestroyStarted: () => {
      markTourCompleted('settings');
      if (onComplete) onComplete();
      driverObj.destroy();
    },
  });

  driverObj.drive();
  return driverObj;
};