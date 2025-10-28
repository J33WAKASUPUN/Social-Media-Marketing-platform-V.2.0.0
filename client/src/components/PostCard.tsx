import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "./PlatformBadge";
import { Edit, Trash2 } from "lucide-react";
import { Post } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusConfig = {
  scheduled: { label: "Scheduled", color: "bg-warning text-warning-foreground" },
  published: { label: "Published", color: "bg-success text-success-foreground" },
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  failed: { label: "Failed", color: "bg-destructive text-destructive-foreground" },
};

export const PostCard = ({ post, onEdit, onDelete }: PostCardProps) => {
  const statusStyle = statusConfig[post.status];
  const contentPreview = post.content.length > 120 ? post.content.slice(0, 120) + "..." : post.content;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {post.media && post.media.length > 0 && (
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={post.media[0]}
            alt="Post media"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {post.media.length > 1 && (
            <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
              +{post.media.length - 1} more
            </div>
          )}
        </div>
      )}
      
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge className={cn("text-xs font-medium", statusStyle.color)}>
            {statusStyle.label}
          </Badge>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => onEdit?.(post.id)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete?.(post.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-foreground/90 line-clamp-3">{contentPreview}</p>

        <div className="flex flex-wrap gap-1.5">
          {post.platforms.map((platform) => (
            <PlatformBadge key={platform} platform={platform} size="sm" />
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t text-xs">
          <span className="text-muted-foreground">
            {post.status === "scheduled" && post.scheduledDate && `📅 ${post.scheduledDate}`}
            {post.status === "published" && post.publishedDate && `✓ ${post.publishedDate}`}
            {post.status === "draft" && "📝 Draft"}
            {post.status === "failed" && "⚠️ Failed to publish"}
          </span>
          {post.engagement && (
            <span className="font-semibold text-foreground flex items-center gap-1">
              <span className="text-primary">
                {post.engagement.likes + post.engagement.comments + post.engagement.shares}
              </span>
              <span className="text-muted-foreground font-normal">engagements</span>
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
