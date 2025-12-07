import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTour } from '@/contexts/TourContext';
import { Sparkles, PlayCircle, X } from 'lucide-react';

export const WelcomeTourDialog: React.FC = () => {
  const { shouldShowWelcomeTour, startTour, dismissWelcomeTour } = useTour();

  const handleStartTour = () => {
    dismissWelcomeTour();
    // Small delay to allow dialog to close
    setTimeout(() => {
      startTour('welcome');
    }, 300);
  };

  return (
    <Dialog open={shouldShowWelcomeTour} onOpenChange={(open) => !open && dismissWelcomeTour()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl">Welcome to SocialFlow! 🎉</DialogTitle>
          <DialogDescription className="text-base mt-2">
            Ready to take control of your social media? Let us show you around!
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <span className="text-sm">📱</span>
              </div>
              <div>
                <p className="font-medium text-sm">Connect Your Channels</p>
                <p className="text-xs text-muted-foreground">Link LinkedIn, Facebook, Instagram & more</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <span className="text-sm">✍️</span>
              </div>
              <div>
                <p className="font-medium text-sm">Create & Schedule Posts</p>
                <p className="text-xs text-muted-foreground">Publish across all platforms at once</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <span className="text-sm">📊</span>
              </div>
              <div>
                <p className="font-medium text-sm">Track Performance</p>
                <p className="text-xs text-muted-foreground">Monitor analytics and optimize your strategy</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={dismissWelcomeTour} className="w-full sm:w-auto">
            <X className="h-4 w-4 mr-2" />
            Skip Tour
          </Button>
          <Button onClick={handleStartTour} className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
            <PlayCircle className="h-4 w-4 mr-2" />
            Start Tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};