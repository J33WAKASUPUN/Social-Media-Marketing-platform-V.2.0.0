import { Channel } from '@/types';
import { getPlatformCapability, type Platform } from '@/lib/platformCapabilities';
import { PlatformBadge } from '@/components/PlatformBadge';
import { Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlatformSelectorProps {
  channels: Channel[];
  selectedChannel: string;
  onSelectChannel: (channelId: string) => void;
  onViewCapabilities: () => void;
  loading?: boolean;
}

export function PlatformSelector({
  channels,
  selectedChannel,
  onSelectChannel,
  onViewCapabilities,
  loading = false,
}: PlatformSelectorProps) {

  const handleClick = (channelId: string) => {
    if (selectedChannel === channelId) {
      onSelectChannel('');
    } else {
      onSelectChannel(channelId);
    }
  };

  if (channels.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-foreground">Target Platform</h3>
        <button
          onClick={onViewCapabilities}
          className="text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 flex items-center gap-1"
        >
          <Info className="h-3 w-3" />
          View Limits
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {channels.map((channel, index) => {
          const uniqueId = channel._id || (channel as any).id || `fallback-${index}`;
          const isSelected = Boolean(selectedChannel) && selectedChannel === uniqueId;
          const cap = getPlatformCapability(channel.provider as Platform);
          const hasWarnings = cap.warnings.some(w => w.includes('❌'));

          return (
            <button
              key={uniqueId}
              onClick={() => handleClick(uniqueId)}
              disabled={loading}
              className={cn(
                "relative flex items-center gap-3 rounded-lg border p-3 transition-all duration-200",
                "focus:outline-none group text-left",
                "bg-background hover:bg-muted/50",
                isSelected 
                  ? "border-violet-600 dark:border-violet-500 bg-violet-50 dark:bg-violet-950/30 ring-1 ring-violet-600 dark:ring-violet-500 shadow-sm" 
                  : "border-border hover:border-violet-300 dark:hover:border-violet-700",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <PlatformBadge platform={channel.provider as any} size="sm" showIcon />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  isSelected ? "text-violet-700 dark:text-violet-300" : "text-foreground"
                )}>
                  {channel.displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{channel.platformUsername || channel.displayName}
                </p>
              </div>
              {hasWarnings && (
                <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0" />
              )}
              {isSelected && (
                <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-violet-600 dark:bg-violet-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}