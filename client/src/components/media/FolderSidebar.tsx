import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, FolderOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderMetadata {
  name: string;
  mediaCount: number;
  totalSize: number;
  totalSizeFormatted: string;
  lastUpdated: string;
}

interface FolderSidebarProps {
  folders: FolderMetadata[];
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
  onManageFolders: () => void;
  loading?: boolean;
}

export function FolderSidebar({
  folders,
  selectedFolder,
  onSelectFolder,
  onManageFolders,
  loading = false,
}: FolderSidebarProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Folders</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onManageFolders}
          title="Manage Folders"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-1 p-2">
            {/* All Media */}
            <button
              className={cn(
                "w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                selectedFolder === "all" && "bg-accent"
              )}
              onClick={() => onSelectFolder("all")}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                <span className="font-medium">All Media</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {folders.reduce((acc, f) => acc + f.mediaCount, 0)}
              </Badge>
            </button>

            {/* Separator */}
            <div className="my-2 border-t" />

            {/* Individual Folders */}
            {loading ? (
              <div className="space-y-2 px-3 py-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : folders.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <Folder className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
                <p className="mt-2 text-xs text-muted-foreground">
                  No folders yet
                </p>
              </div>
            ) : (
              folders.map((folder) => (
  <button
    key={folder.name}
    className={cn(
      "w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
      selectedFolder === folder.name && "bg-accent" // Exact match
    )}
    onClick={() => onSelectFolder(folder.name)} // Pass exact name
  >
    <div className="flex items-center gap-2">
      <Folder
        className="h-4 w-4"
        style={{ color: folder.name === 'Default' ? '#6b7280' : '#8b5cf6' }}
      />
      <span>
        {folder.name}
        {folder.name === 'Default' && (
          <Badge variant="outline" className="ml-2 text-xs">
            Default
          </Badge>
        )}
      </span>
    </div>
    <div className="flex flex-col items-end">
      <span className="text-xs font-medium">{folder.mediaCount}</span>
      <span className="text-xs text-muted-foreground">{folder.totalSizeFormatted}</span>
    </div>
  </button>
))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
