import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { WhatsAppContact, WhatsAppMessage } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { CheckCheck, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactCardProps {
  contact: WhatsAppContact;
  selected: boolean;
  onClick: () => void;
  lastMessage?: WhatsAppMessage;
}

export function ContactCard({
  contact,
  selected,
  onClick,
  lastMessage,
}: ContactCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getMessagePreview = () => {
    if (!lastMessage) return null;

    if (lastMessage.type === 'text') {
      return lastMessage.content.text?.substring(0, 50);
    }
    if (lastMessage.type === 'image') {
      return '📷 Image';
    }
    if (lastMessage.type === 'video') {
      return '🎥 Video';
    }
    if (lastMessage.type === 'audio') {
      return '🎵 Audio';
    }
    if (lastMessage.type === 'document') {
      return '📄 Document';
    }
    if (lastMessage.type === 'template') {
      return '📋 Template';
    }
    return 'Message';
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 rounded-lg text-left transition-all hover:bg-accent',
        selected && 'bg-accent'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-green-600 text-white text-sm">
            {getInitials(contact.name)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <p className="font-medium text-sm truncate">{contact.name}</p>
            {lastMessage && (
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDistanceToNow(new Date(lastMessage.timestamp), {
                  addSuffix: false,
                })}
              </span>
            )}
          </div>

          {lastMessage && (
            <div className="flex items-center gap-1">
              {lastMessage.direction === 'outbound' && getStatusIcon(lastMessage.status)}
              <p className="text-xs text-muted-foreground truncate">
                {getMessagePreview()}
              </p>
            </div>
          )}

          {/* Tags */}
          {contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {contact.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
              {contact.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  +{contact.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}