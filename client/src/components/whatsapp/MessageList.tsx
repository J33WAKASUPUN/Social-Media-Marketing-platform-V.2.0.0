import { ScrollArea } from '@/components/ui/scroll-area';
import { WhatsAppMessage } from '@/types';
import { MessageBubble } from './MessageBubble';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';

interface MessageListProps {
  messages: WhatsAppMessage[];
  loading: boolean;
  currentUserPhone?: string;
}

export function MessageList({
  messages,
  loading,
  currentUserPhone,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <Skeleton className="h-16 w-64 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No messages yet</p>
          <p className="text-xs mt-1">Start a conversation</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-3">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            isOwn={message.direction === 'outbound'}
          />
        ))}
      </div>
    </ScrollArea>
  );
}