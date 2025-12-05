import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, PlayCircle } from 'lucide-react';
import { useTour } from '@/contexts/TourContext';
import { TourId, isTourCompleted } from '@/services/tourService';
import { cn } from '@/lib/utils';

interface TourTriggerProps {
  tourId: TourId;
  variant?: 'icon' | 'button' | 'link';
  className?: string;
  label?: string;
}

export const TourTrigger: React.FC<TourTriggerProps> = ({
  tourId,
  variant = 'icon',
  className,
  label = 'Take a tour',
}) => {
  const { startTour, isTourActive } = useTour();
  const completed = isTourCompleted(tourId);

  const handleClick = () => {
    if (!isTourActive) {
      startTour(tourId);
    }
  };

  if (variant === 'icon') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('relative', className)}
            onClick={handleClick}
            disabled={isTourActive}
          >
            <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            {!completed && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn('gap-2', className)}
        onClick={handleClick}
        disabled={isTourActive}
      >
        <PlayCircle className="h-4 w-4" />
        {label}
        {!completed && (
          <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
        )}
      </Button>
    );
  }

  // Link variant
  return (
    <button
      className={cn(
        'text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 underline-offset-4 hover:underline inline-flex items-center gap-1',
        className
      )}
      onClick={handleClick}
      disabled={isTourActive}
    >
      <HelpCircle className="h-3.5 w-3.5" />
      {label}
    </button>
  );
};