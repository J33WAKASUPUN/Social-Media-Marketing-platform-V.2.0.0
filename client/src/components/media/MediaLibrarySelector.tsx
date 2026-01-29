import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { mediaApi } from '@/services/mediaApi';
import type { Media } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Image as ImageIcon, 
  Video, 
  Check,
  X,
} from 'lucide-react';

interface MediaLibrarySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string; // ✅ ADD: Required brandId prop
  selectedIds: string[];
  onSelect: (ids: string[], items: Media[]) => void;
  mediaType?: 'all' | 'image' | 'video';
  maxSelection?: number;
}

export function MediaLibrarySelector({
  open,
  onOpenChange,
  brandId, // ✅ USE: brandId from props
  selectedIds,
  onSelect,
  mediaType = 'all',
  maxSelection = 10,
}: MediaLibrarySelectorProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelected, setLocalSelected] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (open && brandId) {
      loadMedia();
    }
  }, [open, brandId]);

  useEffect(() => {
    setLocalSelected(selectedIds);
  }, [selectedIds]);

  const loadMedia = async () => {
    if (!brandId) {
      console.error('❌ MediaLibrarySelector: brandId is required');
      return;
    }
    
    try {
      setLoading(true);
      // ✅ FIX: Pass correct filter object
      const response = await mediaApi.getAll({
        brandId,
        type: mediaType === 'all' ? undefined : mediaType,
        limit: 100,
      });
      setMedia(response.data || []);
    } catch (error: any) {
      console.error('Failed to load media:', error);
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter(m => {
    if (mediaType !== 'all' && m.type !== mediaType) return false;
    if (searchQuery) {
      return m.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleToggleSelect = (mediaId: string) => {
    setLocalSelected(prev => {
      if (prev.includes(mediaId)) {
        return prev.filter(id => id !== mediaId);
      }
      if (prev.length >= maxSelection) {
        toast.error(`Maximum ${maxSelection} items allowed`);
        return prev;
      }
      return [...prev, mediaId];
    });
  };

  const handleConfirm = () => {
    const selectedItems = media.filter(m => localSelected.includes(m._id));
    onSelect(localSelected, selectedItems);
    onOpenChange(false);
  };

  const handleClear = () => {
    setLocalSelected([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
          <DialogDescription>
            Choose {mediaType === 'video' ? 'a video' : mediaType === 'image' ? 'images' : 'media'} from your library.
            {maxSelection > 1 && ` (Max: ${maxSelection})`}
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selection Count */}
        {localSelected.length > 0 && (
          <div className="flex items-center justify-between px-2 py-1 bg-muted rounded-lg">
            <span className="text-sm">
              {localSelected.length} selected
            </span>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear all
            </Button>
          </div>
        )}

        {/* Media Grid */}
        <div className="h-[400px] overflow-y-auto pr-4 custom-scrollbar">
          {loading ? (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              {mediaType === 'video' ? (
                <Video className="h-12 w-12 mb-2" />
              ) : (
                <ImageIcon className="h-12 w-12 mb-2" />
              )}
              <p>No {mediaType === 'all' ? 'media' : mediaType + 's'} found</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {filteredMedia.map((item) => {
                const isSelected = localSelected.includes(item._id);
                
                return (
                  <div
                    key={item._id}
                    onClick={() => handleToggleSelect(item._id)}
                    className={cn(
                      'relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-200',
                      isSelected 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-transparent hover:border-muted-foreground/30'
                    )}
                  >
                    {item.type === 'video' ? (
                      <video
                        src={`${item.s3Url}#t=0.1`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={item.s3Url}
                        alt={item.originalName}
                        className="h-full w-full object-cover"
                      />
                    )}
                    
                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.type === 'video' ? (
                          <Video className="h-3 w-3" />
                        ) : (
                          <ImageIcon className="h-3 w-3" />
                        )}
                      </Badge>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={localSelected.length === 0}>
            Select {localSelected.length > 0 && `(${localSelected.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}