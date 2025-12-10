import { 
  Linkedin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  MessageCircle, // ✅ Added for WhatsApp
  Globe,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Add 'whatsapp' to the type definition
export type PlatformType = 'linkedin' | 'facebook' | 'twitter' | 'instagram' | 'youtube' | 'whatsapp';

interface PlatformBadgeProps {
  platform: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showName?: boolean;
}

const PLATFORM_CONFIG: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  linkedin: {
    icon: Linkedin,
    label: 'LinkedIn',
    color: 'text-[#0077b5]',
    bg: 'bg-[#0077b5]/10',
  },
  facebook: {
    icon: Facebook,
    label: 'Facebook',
    color: 'text-[#1877f2]',
    bg: 'bg-[#1877f2]/10',
  },
  twitter: {
    icon: Twitter,
    label: 'Twitter',
    color: 'text-[#1da1f2]',
    bg: 'bg-[#1da1f2]/10',
  },
  instagram: {
    icon: Instagram,
    label: 'Instagram',
    color: 'text-[#e4405f]',
    bg: 'bg-[#e4405f]/10',
  },
  youtube: {
    icon: Youtube,
    label: 'YouTube',
    color: 'text-[#ff0000]',
    bg: 'bg-[#ff0000]/10',
  },
  // ✅ ADDED: WhatsApp Configuration
  whatsapp: {
    icon: MessageCircle, 
    label: 'WhatsApp',
    color: 'text-[#25D366]', // Official WhatsApp Green
    bg: 'bg-[#25D366]/10',
  },
  // ✅ ADDED: Fallback for any unknown platform (prevents future crashes)
  default: {
    icon: Globe,
    label: 'Unknown',
    color: 'text-gray-500',
    bg: 'bg-gray-100',
  }
};

export function PlatformBadge({ platform, size = 'md', className, showName = true }: PlatformBadgeProps) {
  // ✅ SAFETY CHECK: If platform key doesn't exist, use 'default'
  // We use ?.toLowerCase() to handle cases where API might send 'WhatsApp' vs 'whatsapp'
  const config = PLATFORM_CONFIG[platform?.toLowerCase()] || PLATFORM_CONFIG.default;
  
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const badgeSizeClasses = {
    sm: 'text-[10px] px-1.5 py-0',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border-0 gap-1.5 transition-all",
        config.bg,
        config.color,
        badgeSizeClasses[size],
        className
      )}
    >
      <Icon className={sizeClasses[size]} />
      {showName && config.label}
    </Badge>
  );
}