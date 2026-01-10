import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles, Loader2, ArrowRight, Copy, Check } from 'lucide-react';
import { aiApi } from '@/services/aiApi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AIOptimizeButtonProps {
  content: string;
  platform: string;
  onOptimized: (optimizedContent: string) => void;
  disabled?: boolean;
  brandId?: string;
  className?: string;
}

export function AIOptimizeButton({
  content,
  platform,
  onOptimized,
  disabled,
  brandId,
  className,
}: AIOptimizeButtonProps) {
  const [open, setOpen] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState<{
    original: string;
    optimized: string;
    platform: string;
    metadata: {
      originalLength: number;
      optimizedLength: number;
      charLimit: number;
    };
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleOptimize = async () => {
    if (!content.trim()) {
      toast.error('Please write some content first');
      return;
    }

    setOptimizing(true);
    setOpen(true);

    try {
      const response = await aiApi.optimizePost({
        content,
        platform,
        brandId,
      });

      setResult(response.data);
      toast.success('Content optimized successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to optimize content');
      setOpen(false);
    } finally {
      setOptimizing(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onOptimized(result.optimized);
      toast.success('Optimized content applied!');
      setOpen(false);
      setResult(null);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.optimized);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setResult(null);
    setCopied(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOptimize}
        disabled={disabled || !content.trim() || !platform}
        className={cn(
          'group relative overflow-hidden transition-all',
          'hover:border-violet-500 hover:text-violet-600',
          'dark:hover:border-violet-400 dark:hover:text-violet-400',
          className
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Sparkles className="h-4 w-4 mr-2 relative z-10" />
        <span className="relative z-10">AI Optimize</span>
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              AI Content Optimization
            </DialogTitle>
            <DialogDescription>
              Review the AI-optimized version of your content for {platform}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {optimizing ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-violet-200 dark:border-violet-900 animate-pulse" />
                  <Loader2 className="h-16 w-16 text-violet-600 dark:text-violet-400 animate-spin absolute inset-0" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">Optimizing your content...</p>
                  <p className="text-sm text-muted-foreground">
                    AI is analyzing and improving your post for {platform}
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="grid grid-cols-2 gap-4 h-full">
                {/* Original Content */}
                <div className="flex flex-col border rounded-lg overflow-hidden">
                  <div className="bg-muted/30 px-4 py-2 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Original</h3>
                      <Badge variant="outline" className="text-xs">
                        {result.metadata.originalLength} chars
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto bg-card">
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {result.original}
                    </p>
                  </div>
                </div>

                {/* Optimized Content */}
                <div className="flex flex-col border-2 border-violet-500 rounded-lg overflow-hidden">
                  <div className="bg-violet-50 dark:bg-violet-950/30 px-4 py-2 border-b border-violet-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        <h3 className="text-sm font-semibold text-violet-900 dark:text-violet-100">
                          Optimized
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs border-violet-500 text-violet-700 dark:text-violet-300"
                        >
                          {result.metadata.optimizedLength} chars
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopy}
                          className="h-7 px-2"
                        >
                          {copied ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto bg-card">
                    <p className="text-sm whitespace-pre-wrap">
                      {result.optimized}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {result && (
                <>
                  Character limit: {result.metadata.charLimit} •{' '}
                  <span
                    className={cn(
                      result.metadata.optimizedLength > result.metadata.charLimit * 0.9
                        ? 'text-amber-600'
                        : 'text-green-600'
                    )}
                  >
                    {Math.round(
                      (result.metadata.optimizedLength / result.metadata.charLimit) * 100
                    )}
                    % used
                  </span>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {result && (
                <Button
                  onClick={handleApply}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Apply Changes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}