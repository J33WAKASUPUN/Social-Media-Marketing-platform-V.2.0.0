import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlatformBadge } from '@/components/PlatformBadge';
import { FileText, Image, Video, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentType, ContentTypeInfo } from '@/services/bulkPublishApi';
import type { Platform } from '@/lib/platformCapabilities';

interface ContentTypeSelectorProps {
  contentTypes: ContentTypeInfo[];
  selectedType: ContentType | null;
  onSelect: (type: ContentType) => void;
  disabled?: boolean;
}

const typeIcons: Record<ContentType, typeof FileText> = {
  'text-only': FileText,
  'text-image': Image,
  'text-video': Video,
};

const typeColors: Record<ContentType, string> = {
  'text-only': 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
  'text-image': 'border-pink-500 bg-pink-50 dark:bg-pink-950/30',
  'text-video': 'border-red-500 bg-red-50 dark:bg-red-950/30',
};

export function ContentTypeSelector({
  contentTypes,
  selectedType,
  onSelect,
  disabled = false,
}: ContentTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {contentTypes.map((type) => {
        const Icon = typeIcons[type.id];
        const isSelected = selectedType === type.id;
        
        return (
          <Card
            key={type.id}
            className={cn(
              'relative cursor-pointer transition-all duration-200 hover:shadow-md',
              isSelected && typeColors[type.id],
              isSelected && 'ring-2 ring-primary',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !disabled && onSelect(type.id)}
          >
            {isSelected && (
              <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  isSelected 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-muted-foreground'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{type.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {type.description}
                  </p>
                </div>
              </div>

              {/* Target Platforms */}
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Publishes to:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {type.platforms.map((platform) => (
                    <PlatformBadge
                      key={platform}
                      platform={platform as Platform}
                      size="sm"
                      showIcon={true}
                    />
                  ))}
                </div>
              </div>

              {/* Media Support Indicators */}
              <div className="mt-3 flex gap-2">
                {type.supportsImages && (
                  <Badge variant="secondary" className="text-xs">
                    <Image className="h-3 w-3 mr-1" />
                    Images
                  </Badge>
                )}
                {type.supportsVideos && (
                  <Badge variant="secondary" className="text-xs">
                    <Video className="h-3 w-3 mr-1" />
                    Video
                  </Badge>
                )}
                {!type.supportsMedia && (
                  <Badge variant="outline" className="text-xs">
                    Text Only
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}