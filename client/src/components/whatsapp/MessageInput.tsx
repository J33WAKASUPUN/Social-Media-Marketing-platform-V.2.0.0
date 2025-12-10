import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X, Image, Video, FileText, Music } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageInputProps {
  onSendText: (text: string) => void;
  onSendMedia: (file: File, type: 'image' | 'video' | 'audio' | 'document', caption?: string) => void;
  disabled: boolean;
}

export function MessageInput({
  onSendText,
  onSendMedia,
  disabled,
}: MessageInputProps) {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!text.trim() && !selectedFile) return;

    try {
      setSending(true);

      if (selectedFile) {
        // Send media message
        const mediaType = selectedFile.type.startsWith('image/')
          ? 'image'
          : selectedFile.type.startsWith('video/')
          ? 'video'
          : selectedFile.type.startsWith('audio/')
          ? 'audio'
          : 'document';

        await onSendMedia(selectedFile, mediaType, text.trim() || undefined);
      } else {
        // Send text message
        await onSendText(text.trim());
      }

      // Clear input
      setText('');
      setSelectedFile(null);
      setFilePreview(null);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 100MB for video, 5MB for images, 16MB for documents)
    const maxSize = file.type.startsWith('video/')
      ? 100 * 1024 * 1024
      : file.type.startsWith('image/')
      ? 5 * 1024 * 1024
      : 16 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t p-4 bg-card">
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-muted rounded-lg flex items-center gap-3">
          {filePreview ? (
            <img src={filePreview} alt="Preview" className="w-12 h-12 rounded object-cover" />
          ) : (
            <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
              {selectedFile.type.startsWith('video/') && <Video className="h-6 w-6 text-primary" />}
              {selectedFile.type.startsWith('audio/') && <Music className="h-6 w-6 text-primary" />}
              {selectedFile.type.startsWith('application/') && <FileText className="h-6 w-6 text-primary" />}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedFile(null);
              setFilePreview(null);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={disabled || sending}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              <Image className="h-4 w-4 mr-2" />
              Image
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              <Video className="h-4 w-4 mr-2" />
              Video
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Text Input */}
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="resize-none min-h-[44px] max-h-32"
          rows={1}
          disabled={disabled || sending}
        />

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={disabled || sending || (!text.trim() && !selectedFile)}
          size="icon"
          className={cn(
            'shrink-0',
            text.trim() || selectedFile
              ? 'bg-green-600 hover:bg-green-700'
              : ''
          )}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Character Counter */}
      {text.length > 0 && (
        <div className="flex justify-end mt-1">
          <span className="text-xs text-muted-foreground">
            {text.length} / 4096
          </span>
        </div>
      )}
    </div>
  );
}