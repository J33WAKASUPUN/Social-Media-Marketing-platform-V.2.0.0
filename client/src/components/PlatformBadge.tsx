import { Badge } from "@/components/ui/badge";
import { Linkedin, Facebook, Twitter, Instagram, Youtube, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformBadgeProps {
  platform: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
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
  tiktok: {
    name: "TikTok",
    icon: Music2,
    color: "bg-[#000000] hover:bg-[#000000]/90",
  },
};

export const PlatformBadge = ({ platform, showIcon = true, size = "md" }: PlatformBadgeProps) => {
  const config = platformConfig[platform as keyof typeof platformConfig];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        "text-white border-0",
        config.color,
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1",
        size === "lg" && "px-4 py-1.5 text-base"
      )}
    >
      {showIcon && <Icon className={cn("mr-1", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />}
      {config.name}
    </Badge>
  );
};
