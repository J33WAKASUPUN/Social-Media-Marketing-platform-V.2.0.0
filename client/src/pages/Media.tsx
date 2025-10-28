import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Search, Grid3x3, List, Image as ImageIcon, Play } from "lucide-react";
import { mockMedia } from "@/lib/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Media() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedMedia, setSelectedMedia] = useState<typeof mockMedia[0] | null>(null);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-full bg-muted p-6">
        <ImageIcon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No media uploaded yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">Upload your first image or video</p>
      <Button className="mt-4" variant="gradient">
        <Upload className="mr-2 h-4 w-4" />
        Upload Media
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Media Library"
        description="Manage your images and videos"
        actions={
          <Button variant="gradient">
            <Upload className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search media..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {mockMedia.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "space-y-2"}>
          {mockMedia.map((media) => (
            <Card
              key={media.id}
              className="group cursor-pointer overflow-hidden hover-lift"
              onClick={() => setSelectedMedia(media)}
            >
              {viewMode === "grid" ? (
                <div>
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={media.url}
                      alt={media.altText}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                    {media.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium">{media.filename}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{media.size}</span>
                      <Badge variant="outline" className="text-xs">
                        Used in {media.usedIn}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded bg-muted">
                    <img src={media.url} alt={media.altText} className="h-full w-full object-cover" />
                    {media.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{media.filename}</p>
                    <p className="text-sm text-muted-foreground">
                      {media.size} • {media.dimensions}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{media.uploadDate}</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      Used in {media.usedIn}
                    </Badge>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.filename}</DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.altText}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              <div className="space-y-4 lg:col-span-2">
                <div>
                  <Label>File Details</Label>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>Size: {selectedMedia.size}</p>
                    <p>Dimensions: {selectedMedia.dimensions}</p>
                    <p>Uploaded: {selectedMedia.uploadDate}</p>
                  </div>
                </div>
                <div>
                  <Label>Tags</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedMedia.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="altText">Alt Text</Label>
                  <Textarea
                    id="altText"
                    className="mt-2"
                    defaultValue={selectedMedia.altText}
                    rows={3}
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Used in {selectedMedia.usedIn} posts
                  </p>
                </div>
                <Button variant="destructive" className="w-full">
                  Delete Media
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
