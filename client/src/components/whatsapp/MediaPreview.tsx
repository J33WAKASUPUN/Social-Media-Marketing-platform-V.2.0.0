import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MediaPreviewProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  onClose: () => void;
}

export function MediaPreview({
  mediaUrl,
  mediaType,
  caption,
  onClose,
}: MediaPreviewProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = `whatsapp_${mediaType}_${Date.now()}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Media Preview</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4">
          <div className="relative w-full bg-muted rounded-lg overflow-hidden">
            {mediaType === 'image' ? (
              <img
                src={mediaUrl}
                alt="Media preview"
                className="w-full h-auto max-h-[70vh] object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                }}
              />
            ) : (
              <video
                src={mediaUrl}
                controls
                className="w-full h-auto max-h-[70vh]"
                onError={(e) => {
                  e.currentTarget.poster = 'https://via.placeholder.com/800x600?text=Video+Not+Available';
                }}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {caption && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">{caption}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}