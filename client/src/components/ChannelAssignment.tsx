import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlatformBadge } from '@/components/PlatformBadge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Platform } from '@/lib/platformCapabilities';
import type { AvailableChannelsResponse, ChannelAssignment as ChannelAssignmentType } from '@/services/bulkPublishApi';

interface ChannelAssignmentProps {
  availableChannels: AvailableChannelsResponse | null;
  assignments: ChannelAssignmentType[];
  onAssignmentChange: (platform: string, channelId: string) => void;
  loading?: boolean;
}

export function ChannelAssignment({
  availableChannels,
  assignments,
  onAssignmentChange,
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

  const { targetPlatforms, channels, allConnected, missingPlatforms } = availableChannels;

  return (
    <div className="space-y-4">
      {/* Warning for missing platforms */}
      {missingPlatforms.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Missing channels:</span> You need to connect{' '}
            {missingPlatforms.map((p, i) => (
              <span key={p}>
                <span className="capitalize">{p}</span>
                {i < missingPlatforms.length - 1 && ', '}
              </span>
            ))}{' '}
            to publish to all platforms.
            <a href="/channels" className="ml-2 underline">
              Connect channels →
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* All connected indicator */}
      {allConnected && (
        <Alert className="border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-700 dark:text-emerald-400">
            All required channels are connected! You're ready to publish.
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

          return (
            <Card 
              key={platform}
              className={cn(
                'relative transition-all duration-200',
                !hasChannels && 'border-destructive/50 bg-destructive/5',
                currentAssignment && 'border-emerald-500/50'
              )}
            >
              {currentAssignment && (
                <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}

              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <PlatformBadge platform={platform as Platform} size="sm" />
                </CardTitle>
              </CardHeader>

              <CardContent>
                {hasChannels ? (
                  <Select
                    value={currentAssignment?.channel || ''}
                    onValueChange={(value) => onAssignmentChange(platform, value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full">
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
                ) : (
                  <div className="text-center py-2">
                    <AlertCircle className="h-8 w-8 text-destructive/50 mx-auto mb-2" />
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

                {/* Selected Channel Display */}
                {selectedChannel && (
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}