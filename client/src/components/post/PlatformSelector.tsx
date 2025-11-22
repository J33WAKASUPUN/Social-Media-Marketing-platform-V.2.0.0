import { getPlatformCapability, type Platform } from '@/lib/platformCapabilities';
import type { Channel } from '@/types';
import { PlatformBadge } from '@/components/PlatformBadge';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

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
        <h3 className="text-sm font-medium text-gray-700">Target Platform</h3>
        <button
          onClick={onViewCapabilities}
          className="text-xs font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1"
        >
          <Info className="h-3 w-3" />
          View Limits
        </button>
      </div>

      {/* ✅ GRID LAYOUT (No Scrolling) - 2 columns on small screens, 3 on large */}
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
              className={`
                relative flex items-center gap-3 rounded-lg border p-3 transition-all duration-200
                focus:outline-none group text-left
                ${isSelected 
                  ? 'border-violet-600 bg-violet-50 ring-1 ring-violet-600 shadow-sm' 
                  : 'border-gray-200 bg-white hover:border-violet-300 hover:shadow-sm'
                }
                ${loading ? 'opacity-50' : ''}
              `}
            >
              {/* Selection Circle */}
              <div className={`
                flex h-5 w-5 items-center justify-center rounded-full border transition-colors flex-shrink-0
                ${isSelected ? 'border-violet-600 bg-violet-600' : 'border-gray-300 bg-white group-hover:border-violet-400'}
              `}>
                {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
              </div>

              {/* Platform Info */}
              <div className="flex flex-col items-start min-w-0 flex-1">
                <div className="flex items-center gap-1.5 w-full">
                  <PlatformBadge platform={channel.provider as Platform} size="sm" />
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {channel.displayName}
                  </span>
                </div>
                
                {/* Tiny Stats Line */}
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                    {cap.limits.maxTextLength > 1000 
                      ? `${(cap.limits.maxTextLength / 1000).toFixed(0)}k` 
                      : cap.limits.maxTextLength} chars
                  </span>
                  {hasWarnings && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}