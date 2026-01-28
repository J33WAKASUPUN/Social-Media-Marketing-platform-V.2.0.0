import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlatformBadge } from '@/components/PlatformBadge';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Clock, 
  ExternalLink,
  PartyPopper,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Platform } from '@/lib/platformCapabilities';
import type { PublishResult, BulkPostStatus } from '@/services/bulkPublishApi';

interface BulkPublishProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: BulkPostStatus;
  publishResults: PublishResult[];
  stats: {
    totalPlatforms: number;
    successCount: number;
    failedCount: number;
    pendingCount: number;
  };
  onViewPosts?: () => void;
  onClose?: () => void;
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-muted-foreground', label: 'Pending' },
  queued: { icon: Loader2, color: 'text-blue-500', label: 'Queued' },
  publishing: { icon: Loader2, color: 'text-blue-500', label: 'Publishing...' },
  published: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Published' },
  failed: { icon: XCircle, color: 'text-destructive', label: 'Failed' },
  cancelled: { icon: XCircle, color: 'text-muted-foreground', label: 'Cancelled' },
};

export function BulkPublishProgressDialog({
  open,
  onOpenChange,
  status,
  publishResults,
  stats,
  onViewPosts,
  onClose,
}: BulkPublishProgressDialogProps) {
  const [progress, setProgress] = useState(0);

  // Calculate progress
  useEffect(() => {
    if (stats.totalPlatforms === 0) {
      setProgress(0);
      return;
    }
    
    const completed = stats.successCount + stats.failedCount;
    const newProgress = Math.round((completed / stats.totalPlatforms) * 100);
    setProgress(newProgress);
  }, [stats]);

  const isComplete = status === 'completed' || status === 'partial' || status === 'failed';
  const isSuccess = status === 'completed';
  const isPartial = status === 'partial';

  const getOverallStatusMessage = () => {
    switch (status) {
      case 'pending':
        return 'Preparing to publish...';
      case 'publishing':
        return `Publishing to ${stats.pendingCount} platform${stats.pendingCount !== 1 ? 's' : ''}...`;
      case 'completed':
        return '🎉 All posts published successfully!';
      case 'partial':
        return `Published to ${stats.successCount} of ${stats.totalPlatforms} platforms`;
      case 'failed':
        return 'Publishing failed. Please try again.';
      case 'cancelled':
        return 'Publishing was cancelled.';
      default:
        return 'Processing...';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSuccess && <PartyPopper className="h-5 w-5 text-emerald-500" />}
            {isPartial && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            {status === 'failed' && <XCircle className="h-5 w-5 text-destructive" />}
            {!isComplete && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            Bulk Publishing
          </DialogTitle>
          <DialogDescription>
            {getOverallStatusMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <div className="text-2xl font-bold text-emerald-600">{stats.successCount}</div>
              <div className="text-xs text-muted-foreground">Published</div>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <div className="text-2xl font-bold text-amber-600">{stats.pendingCount}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
              <div className="text-2xl font-bold text-destructive">{stats.failedCount}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
          </div>

          {/* Platform Results */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {publishResults.map((result, idx) => {
              const config = statusConfig[result.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              const isSpinning = result.status === 'publishing' || result.status === 'queued';

              return (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    result.status === 'published' && 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30',
                    result.status === 'failed' && 'bg-red-50/50 dark:bg-red-950/20 border-red-500/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <PlatformBadge platform={result.platform as Platform} size="sm" />
                    <div>
                      <p className="text-sm font-medium">
                        {result.channel?.displayName || result.platform}
                      </p>
                      {result.error && (
                        <p className="text-xs text-destructive truncate max-w-[150px]">
                          {result.error}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusIcon className={cn(
                      'h-4 w-4',
                      config.color,
                      isSpinning && 'animate-spin'
                    )} />
                    
                    {result.platformUrl && result.status === 'published' && (
                      <a
                        href={result.platformUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          {isComplete ? (
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
              {onViewPosts && (
                <Button onClick={onViewPosts} className="flex-1">
                  View Posts
                </Button>
              )}
            </div>
          ) : (
            <Button variant="outline" onClick={onClose} disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Publishing...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}