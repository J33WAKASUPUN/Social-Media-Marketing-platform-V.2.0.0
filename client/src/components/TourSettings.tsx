import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTour } from '@/contexts/TourContext';
import { isTourCompleted, TourId } from '@/services/tourService';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  GraduationCap,
  Sparkles,
  Settings,
} from 'lucide-react';

// Only Welcome and Settings tours
const tourInfo: Array<{ 
  id: TourId; 
  title: string; 
  description: string;
  path: string;
  icon: React.ElementType;
}> = [
  { 
    id: 'welcome', 
    title: 'Welcome Tour', 
    description: 'Get introduced to SocialFlow and learn the basics of navigation',
    path: '/dashboard',
    icon: Sparkles
  },
  { 
    id: 'settings', 
    title: 'Settings Tour', 
    description: 'Learn how to customize your profile and preferences',
    path: '/settings',
    icon: Settings
  },
];

export const TourSettings: React.FC = () => {
  const navigate = useNavigate();
  const { startTour, resetTours, isTourActive, completedTours } = useTour();

  const handleStartTour = (tourId: TourId, path: string) => {
    // If we're already on the correct page, just start the tour
    if (window.location.pathname === path) {
      startTour(tourId);
    } else {
      // Navigate to the page first, then start the tour after a delay
      navigate(path);
      setTimeout(() => {
        startTour(tourId);
      }, 500);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-violet-100 dark:bg-violet-900/30">
            <GraduationCap className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <CardTitle>Interactive Tours</CardTitle>
            <CardDescription>
              Learn how to use SocialFlow with guided walkthroughs
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tour List */}
        <div className="grid gap-3">
          {tourInfo.map((tour) => {
            const isCompleted = completedTours.includes(tour.id) || isTourCompleted(tour.id);
            const Icon = tour.icon;
            
            return (
              <div
                key={tour.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}>
                    <Icon className={`h-5 w-5 ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{tour.title}</h4>
                      {isCompleted && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{tour.description}</p>
                  </div>
                </div>
                <Button
                  variant={isCompleted ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleStartTour(tour.id, tour.path)}
                  disabled={isTourActive}
                  className="shrink-0"
                >
                  <Play className="h-4 w-4 mr-1" />
                  {isCompleted ? 'Replay' : 'Start'}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Reset All Tours */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Reset All Tours</p>
              <p className="text-xs text-muted-foreground">
                Mark all tours as incomplete to see them again
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetTours}
              disabled={isTourActive || completedTours.length === 0}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};