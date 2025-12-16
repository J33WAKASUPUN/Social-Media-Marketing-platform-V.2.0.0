import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PublishingProgressDialogProps {
  open: boolean;
  status: 'publishing' | 'success' | 'error';
  progress: number;
  message?: string;
  onClose?: () => void;
}

export function PublishingProgressDialog({
  open,
  status,
  progress,
  message,
  onClose,
}: PublishingProgressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={status === 'success' || status === 'error' ? onClose : undefined}>
      <DialogContent 
        className="sm:max-w-md" 
        hideClose={status === 'publishing'}
        onPointerDownOutside={(e) => status === 'publishing' && e.preventDefault()}
        onEscapeKeyDown={(e) => status === 'publishing' && e.preventDefault()}
      >
        {/* ✅ ADD VISUALLY HIDDEN TITLE FOR ACCESSIBILITY */}
        <DialogTitle className="sr-only">
          {status === 'publishing' && 'Publishing Post'}
          {status === 'success' && 'Post Published Successfully'}
          {status === 'error' && 'Publishing Failed'}
        </DialogTitle>

        <div className="flex flex-col items-center justify-center py-8 px-4 space-y-6">
          {/* Status Icon */}
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center",
            status === 'publishing' && "bg-violet-100 dark:bg-violet-900/30",
            status === 'success' && "bg-green-100 dark:bg-green-900/30",
            status === 'error' && "bg-red-100 dark:bg-red-900/30"
          )}>
            {status === 'publishing' && (
              <Loader2 className="h-10 w-10 text-violet-600 dark:text-violet-400 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            )}
            {status === 'error' && (
              <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
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
            
            <p className="text-sm text-muted-foreground">
              {status === 'publishing' && 'Please wait while we publish your post to the platform'}
              {status === 'success' && (message || 'Your post has been published and is now live')}
              {status === 'error' && (message || 'Failed to publish your post. Please try again.')}
            </p>
          </div>

          {/* Progress Bar (only show during publishing) */}
          {status === 'publishing' && (
            <div className="w-full space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {progress < 30 && 'Preparing your content...'}
                {progress >= 30 && progress < 60 && 'Uploading media...'}
                {progress >= 60 && progress < 90 && 'Publishing to platform...'}
                {progress >= 90 && 'Finalizing...'}
              </p>
            </div>
          )}

          {/* Action Button (only show on success/error) */}
          {(status === 'success' || status === 'error') && (
            <Button
              onClick={onClose}
              className={cn(
                "w-full",
                status === 'success' && "bg-green-600 hover:bg-green-700",
                status === 'error' && "bg-red-600 hover:bg-red-700"
              )}
            >
              {status === 'success' ? 'View Posts' : 'Try Again'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}