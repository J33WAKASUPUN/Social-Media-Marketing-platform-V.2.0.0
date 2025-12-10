import { WhatsAppMessage } from '@/types';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, Clock, FileText, Image, Video, Music } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { MediaPreview } from './MediaPreview';
import { useState } from 'react';

interface MessageBubbleProps {
  message: WhatsAppMessage;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [showMediaPreview, setShowMediaPreview] = useState(false);

  const getStatusIcon = () => {
    if (message.direction !== 'outbound') return null;

    switch (message.status) {
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'failed':
        return <Clock className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content.text}
          </p>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <div
              className="relative rounded-lg overflow-hidden cursor-pointer bg-muted"
              onClick={() => setShowMediaPreview(true)}
            >
              <img
                src={`https://graph.facebook.com/v18.0/${message.content.image?.id}`}
                alt="Image"
                className="max-w-xs rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Unavailable';
                }}
              />
            </div>
            {message.content.image?.caption && (
              <p className="text-sm">{message.content.image.caption}</p>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Video className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Video</p>
                <p className="text-xs text-muted-foreground">Click to view</p>
              </div>
            </div>
            {message.content.video?.caption && (
              <p className="text-sm">{message.content.video.caption}</p>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Music className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Audio Message</p>
              <p className="text-xs text-muted-foreground">Click to play</p>
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {message.content.document?.filename || 'Document'}
              </p>
              <p className="text-xs text-muted-foreground">
                {message.content.document?.mime_type || 'File'}
              </p>
            </div>
          </div>
        );

      case 'template':
        return (
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs">
              📋 Template: {message.content.template?.name}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Template message sent
            </p>
          </div>
        );

      case 'call':
        return (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <div className="text-2xl">
              {message.content.call?.videoCall ? '📹' : '📞'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {message.content.call?.videoCall ? 'Video Call' : 'Voice Call'}
              </p>
              <p className="text-xs text-muted-foreground">
                {message.content.call?.callStatus || 'Unknown status'}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <p className="text-sm text-muted-foreground italic">
            Unsupported message type: {message.type}
          </p>
        );
    }
  };

  return (
    <>
      <div
        className={cn(
          'flex',
          isOwn ? 'justify-end' : 'justify-start'
        )}
      >
        <div
          className={cn(
            'max-w-[70%] rounded-lg px-4 py-2 shadow-sm',
            isOwn
              ? 'bg-green-600 text-white'
              : 'bg-card border text-foreground'
          )}
        >
          {/* Message Content */}
          <div className="mb-1">{renderContent()}</div>

          {/* Timestamp & Status */}
          <div className="flex items-center justify-end gap-1 mt-1">
            <span
              className={cn(
                'text-xs',
                isOwn ? 'text-green-100' : 'text-muted-foreground'
              )}
            >
              {format(new Date(message.timestamp), 'HH:mm')}
            </span>
            {getStatusIcon()}
          </div>

          {/* Error message if failed */}
          {message.status === 'failed' && message.errors && (
            <div className="mt-2 text-xs text-red-200 bg-red-700/30 p-2 rounded">
              {message.errors[0]?.message || 'Failed to send'}
            </div>
          )}
        </div>
      </div>

      {/* Media Preview Dialog */}
      {message.type === 'image' && showMediaPreview && (
        <MediaPreview
          mediaUrl={`https://graph.facebook.com/v18.0/${message.content.image?.id}`}
          mediaType="image"
          caption={message.content.image?.caption}
          onClose={() => setShowMediaPreview(false)}
        />
      )}
    </>
  );
}