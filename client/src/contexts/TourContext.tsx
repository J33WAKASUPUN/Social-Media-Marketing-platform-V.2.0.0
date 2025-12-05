import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  TourId, 
  isTourCompleted, 
  resetAllTours, 
  isNewUser,
  markUserAsReturning,
  startWelcomeTour,
  startSettingsTour,
  UserPermissions,
} from '@/services/tourService';
import { usePermissions } from '@/hooks/usePermissions';

interface TourContextType {
  startTour: (tourId: TourId) => void;
  isTourActive: boolean;
  completedTours: TourId[];
  resetTours: () => void;
  shouldShowWelcomeTour: boolean;
  dismissWelcomeTour: () => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [completedTours, setCompletedTours] = useState<TourId[]>([]);
  const [shouldShowWelcomeTour, setShouldShowWelcomeTour] = useState(false);
  
  // Get user permissions
  const permissions = usePermissions();

  // Load completed tours on mount
  useEffect(() => {
    const tours: TourId[] = ['welcome', 'settings'];
    const completed = tours.filter(id => isTourCompleted(id));
    setCompletedTours(completed);
    
    // Check if should show welcome tour dialog
    if (isNewUser() && !isTourCompleted('welcome')) {
      setShouldShowWelcomeTour(true);
    }
  }, []);

  const startTour = useCallback((tourId: TourId) => {
    setIsTourActive(true);
    
    const onComplete = () => {
      setIsTourActive(false);
      setCompletedTours(prev => 
        prev.includes(tourId) ? prev : [...prev, tourId]
      );
    };

    // Convert permissions to the format expected by tourService
    const tourPermissions: UserPermissions = {
      canConnectChannels: permissions.canConnectChannels,
      canViewMedia: permissions.canViewMedia,
      canViewAnalytics: permissions.canViewAnalytics,
      canViewPosts: permissions.canViewPosts,
      canCreatePosts: permissions.canCreatePosts,
    };

    switch (tourId) {
      case 'welcome':
        // Pass permissions to welcome tour
        startWelcomeTour(onComplete, tourPermissions);
        break;
      case 'settings':
        startSettingsTour(onComplete);
        break;
      default:
        setIsTourActive(false);
    }
  }, [permissions]);

  const resetTours = useCallback(() => {
    resetAllTours();
    setCompletedTours([]);
    setShouldShowWelcomeTour(true);
  }, []);

  const dismissWelcomeTour = useCallback(() => {
    setShouldShowWelcomeTour(false);
    markUserAsReturning();
  }, []);

  return (
    <TourContext.Provider value={{
      startTour,
      isTourActive,
      completedTours,
      resetTours,
      shouldShowWelcomeTour,
      dismissWelcomeTour,
    }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};