import { Badge } from "@/components/ui/badge";
import { Linkedin, Facebook, Twitter, Instagram, Youtube, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformBadgeProps {
  platform: 'linkedin' | 'facebook' | 'twitter' | 'instagram' | 'youtube' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const platformConfig = {
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-[#0077B5] hover:bg-[#0077B5]/90",
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "bg-[#1877F2] hover:bg-[#1877F2]/90",
  },
  twitter: {
    name: "Twitter",
    icon: Twitter,
    color: "bg-[#1DA1F2] hover:bg-[#1DA1F2]/90",
  },
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "bg-gradient-to-r from-[#E4405F] to-[#F77737] hover:opacity-90",
  },
  youtube: {
    name: "YouTube",
    icon: Youtube,
    color: "bg-[#FF0000] hover:bg-[#FF0000]/90",
  },
  whatsapp: {
    name: "WhatsApp",
    icon: MessageCircle,
    color: "bg-[#25D366] hover:bg-[#25D366]/90",
  },
};

export function PlatformBadge({ platform, size = 'md', showIcon = true }: PlatformBadgeProps) {
  const config = platformConfig[platform];
  
  // If platform not found, return fallback
  if (!config) {
    console.warn(`Unknown platform: ${platform}`);
    return (
      <Badge className="bg-gray-500 text-white">
        {platform}
      </Badge>
    );
  }

  const Icon = config.icon;

  const sizeClasses = {
    sm: "h-6 px-2 text-xs",
    md: "h-8 px-3 text-sm",
    lg: "h-10 px-4 text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Badge
      className={cn(
        "text-white font-medium",
        config.color,
        sizeClasses[size],
        "flex items-center gap-1.5"
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.name}
    </Badge>
  );
}