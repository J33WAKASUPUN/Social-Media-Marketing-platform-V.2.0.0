import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PublishingProgressDialogProps {
  open: boolean;
  status: 'publishing' | 'success' | 'error';
  progress: number;
  message?: string;
  onClose: () => void;
}

export function PublishingProgressDialog({
  open,
  status,
  progress,
  message,
  onClose,
}: PublishingProgressDialogProps) {
  
  // Handle the open change logic safely
  const handleOpenChange = (isOpen: boolean) => {
    // If trying to close (isOpen is false)
    if (!isOpen) {
      // Only allow closing if status is NOT publishing
      if (status !== 'publishing') {
        onClose();
      }
      // If publishing, ignore the close attempt (effectively blocking it)
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-md [&>button]:hidden" /* CSS trick to hide the X close button */
        onPointerDownOutside={(e) => status === 'publishing' && e.preventDefault()}
        onEscapeKeyDown={(e) => status === 'publishing' && e.preventDefault()}
      >
        <div className="flex flex-col items-center justify-center py-8 px-4 space-y-6">
          {/* Status Icon */}
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
            status === 'publishing' && "bg-violet-100 dark:bg-violet-900/30",
            status === 'success' && "bg-green-100 dark:bg-green-900/30",
            status === 'error' && "bg-red-100 dark:bg-red-900/30"
          )}>
            {status === 'publishing' && (
              <Loader2 className="h-10 w-10 text-violet-600 dark:text-violet-400 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400 animate-in zoom-in" />
            )}
            {status === 'error' && (
              <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400 animate-in zoom-in" />
            )}
          </div>

          {/* Title & Message */}
          <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-2">
            <h2 className={cn(
              "text-xl font-semibold",
              status === 'publishing' && "text-violet-900 dark:text-violet-100",
              status === 'success' && "text-green-900 dark:text-green-100",
              status === 'error' && "text-red-900 dark:text-red-100"
            )}>
              {status === 'publishing' && 'Publishing Your Post...'}
              {status === 'success' && '🎉 Published Successfully!'}
              {status === 'error' && 'Publishing Failed'}
            </h2>
            
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {status === 'publishing' && 'Please wait while we process your media and publish to the platform.'}
              {status === 'success' && (message || 'Your post is now live.')}
              {status === 'error' && (message || 'Something went wrong.')}
            </p>
          </div>

          {/* Progress Bar */}
          {status === 'publishing' && (
            <div className="w-full space-y-2 animate-in fade-in">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>{progress}%</span>
                <span>
                  {progress < 30 && 'Preparing...'}
                  {progress >= 30 && progress < 60 && 'Uploading media...'}
                  {progress >= 60 && 'Finalizing...'}
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          {(status === 'success' || status === 'error') && (
            <Button
              onClick={onClose}
              className={cn(
                "w-full animate-in fade-in slide-in-from-bottom-4",
                status === 'success' && "bg-green-600 hover:bg-green-700 text-white",
                status === 'error' && "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              {status === 'success' ? 'View Post' : 'Close'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}