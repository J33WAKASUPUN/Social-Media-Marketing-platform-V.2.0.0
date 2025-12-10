import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
}

export function FileUploadButton({
  onFileSelect,
  accept = 'image/*,video/*,.pdf,.doc,.docx',
  maxSize = 16 * 1024 * 1024, // 16MB default
  disabled = false,
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`File too large. Max size: ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
      return;
    }

    onFileSelect(file);

    // Reset input
    e.target.value = '';
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={disabled}
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload File
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}