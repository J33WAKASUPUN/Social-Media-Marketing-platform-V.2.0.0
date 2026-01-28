import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlatformBadge } from '@/components/PlatformBadge';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Link, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Platform } from '@/lib/platformCapabilities';
import type { AvailableChannelsResponse, ChannelAssignment as ChannelAssignmentType } from '@/services/bulkPublishApi';

interface ChannelAssignmentProps {
  availableChannels: AvailableChannelsResponse | null;
  assignments: ChannelAssignmentType[];
  onAssignmentChange: (platform: string, channelId: string) => void;
  onPlatformToggle?: (platform: string, enabled: boolean) => void;
  enabledPlatforms?: string[];
  loading?: boolean;
}

export function ChannelAssignment({
  availableChannels,
  assignments,
  onAssignmentChange,
  onPlatformToggle,
  enabledPlatforms,
  loading = false,
}: ChannelAssignmentProps) {
  if (!availableChannels) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Select a content type to see available channels
          </div>
        </CardContent>
      </Card>
    );
  }

  const { targetPlatforms, channels, missingPlatforms } = availableChannels;

  // Calculate connected vs selected platforms
  const connectedPlatforms = targetPlatforms.filter(p => !missingPlatforms.includes(p));
  const selectedPlatformCount = enabledPlatforms?.length ?? connectedPlatforms.length;
  const hasSelections = selectedPlatformCount > 0;

  return (
    <div className="space-y-4">
      {/* Info banner about platform selection */}
      <Alert className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
        <CheckCircle2 className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          <span className="font-medium">Flexible Publishing:</span> Toggle platforms on/off to customize where your content is published.
          {selectedPlatformCount > 0 && (
            <span className="ml-1">
              Currently publishing to <strong>{selectedPlatformCount}</strong> platform{selectedPlatformCount !== 1 ? 's' : ''}.
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Warning for missing platforms */}
      {missingPlatforms.length > 0 && (
        <Alert variant="default" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            <span className="font-medium">Some channels not connected:</span>{' '}
            {missingPlatforms.map((p, i) => (
              <span key={p}>
                <span className="capitalize">{p}</span>
                {i < missingPlatforms.length - 1 && ', '}
              </span>
            ))}.{' '}
            <a href="/channels" className="underline font-medium">
              Connect channels →
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* No selection warning */}
      {!hasSelections && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please enable at least one platform to publish your content.
          </AlertDescription>
        </Alert>
      )}

      {/* Platform Channel Selection */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {targetPlatforms.map((platform) => {
          const platformChannels = channels[platform] || [];
          const currentAssignment = assignments.find(a => a.platform === platform);
          const selectedChannel = platformChannels.find(c => c._id === currentAssignment?.channel);
          const hasChannels = platformChannels.length > 0;
          
          // Check if platform is enabled (default to true if enabledPlatforms not provided)
          const isPlatformEnabled = enabledPlatforms 
            ? enabledPlatforms.includes(platform) 
            : hasChannels;
          
          const canToggle = hasChannels && onPlatformToggle;

          return (
            <Card 
              key={platform}
              className={cn(
                'relative transition-all duration-200',
                !hasChannels && 'border-muted bg-muted/30 opacity-60',
                hasChannels && !isPlatformEnabled && 'border-muted bg-muted/20 opacity-70',
                hasChannels && isPlatformEnabled && currentAssignment && 'border-emerald-500/50 shadow-sm',
                hasChannels && isPlatformEnabled && !currentAssignment && 'border-amber-500/50'
              )}
            >
              {/* Enabled indicator */}
              {isPlatformEnabled && currentAssignment && (
                <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}
              
              {/* Disabled indicator */}
              {hasChannels && !isPlatformEnabled && (
                <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-muted-foreground/50 flex items-center justify-center">
                  <Minus className="h-3 w-3 text-white" />
                </div>
              )}

              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <PlatformBadge platform={platform as Platform} size="sm" />
                  </div>
                  
                  {/* Platform Toggle */}
                  {canToggle && (
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs",
                        isPlatformEnabled ? "text-emerald-600" : "text-muted-foreground"
                      )}>
                        {isPlatformEnabled ? 'On' : 'Off'}
                      </span>
                      <Switch
                        checked={isPlatformEnabled}
                        onCheckedChange={(checked) => onPlatformToggle(platform, checked)}
                        disabled={loading}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent>
                {hasChannels ? (
                  <div className={cn(!isPlatformEnabled && 'pointer-events-none')}>
                    <Select
                      value={currentAssignment?.channel || ''}
                      onValueChange={(value) => onAssignmentChange(platform, value)}
                      disabled={loading || !isPlatformEnabled}
                    >
                      <SelectTrigger className={cn(
                        "w-full",
                        !isPlatformEnabled && "opacity-50"
                      )}>
                        <SelectValue placeholder="Select account..." />
                      </SelectTrigger>
                      <SelectContent>
                        {platformChannels.map((channel) => (
                          <SelectItem key={channel._id} value={channel._id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={channel.avatar} />
                                <AvatarFallback className="text-xs">
                                  {channel.displayName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate">{channel.displayName}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <AlertCircle className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      No {platform} account connected
                    </p>
                    <a
                      href="/channels"
                      className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      <Link className="h-3 w-3" />
                      Connect now
                    </a>
                  </div>
                )}

                {/* Selected Channel Display - Only show when enabled */}
                {selectedChannel && isPlatformEnabled && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedChannel.avatar} />
                      <AvatarFallback className="text-xs">
                        {selectedChannel.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {selectedChannel.displayName}
                      </p>
                      {selectedChannel.platformUsername && (
                        <p className="text-xs text-muted-foreground truncate">
                          @{selectedChannel.platformUsername}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Disabled state message */}
                {hasChannels && !isPlatformEnabled && (
                  <p className="text-xs text-muted-foreground text-center mt-2 italic">
                    Platform disabled - won't publish here
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}