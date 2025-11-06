import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Search,
  Grid3x3,
  List,
  Image as ImageIcon,
  Filter,
  Tag,
  Trash2,
  AlertCircle,
  HardDrive,
  FolderCog,
} from 'lucide-react';
import { toast } from 'sonner';
import { useBrand } from '@/contexts/BrandContext';
import { mediaApi } from '@/services/mediaApi';
import type { Media, MediaStats } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ✅ Import folder components
import {
  MediaCard,
  UploadDialog,
  MediaPreviewDialog,
  EditMetadataDialog,
  FolderManagementDialog,
  FolderSidebar,
  CreateFolderDialog,
} from '@/components/media';

interface FolderMetadata {
  name: string;
  mediaCount: number;
  totalSize: number;
  totalSizeFormatted: string;
  lastUpdated: string;
}

export default function Media() {
  const { currentBrand } = useBrand();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video'>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'createdAt' | 'size' | 'filename' | 'usageCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // ✅ Folder management state
  const [folders, setFolders] = useState<string[]>([]);
  const [foldersMetadata, setFoldersMetadata] = useState<FolderMetadata[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [folderManagementOpen, setFolderManagementOpen] = useState(false);
  
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);

  // ✅ Fetch folders with metadata
  const fetchFoldersMetadata = useCallback(async () => {
    if (!currentBrand) return;

    try {
      setLoadingFolders(true);
      const response = await mediaApi.getFoldersMetadata(currentBrand._id);
      setFoldersMetadata(response.data);
      setFolders(response.data.map((f: FolderMetadata) => f.name));
    } catch (error) {
      console.error('Failed to fetch folders metadata:', error);
    } finally {
      setLoadingFolders(false);
    }
  }, [currentBrand]);

  // ✅ Fetch media with filters
  const fetchMedia = useCallback(async () => {
    if (!currentBrand) return;

    try {
      setLoading(true);
      const response = await mediaApi.getAll({
        brandId: currentBrand._id,
        type: selectedType === 'all' ? undefined : selectedType,
        folder: selectedFolder === 'all' ? undefined : selectedFolder,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        search: searchQuery || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 24,
      });

      setMedia(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      console.error('Failed to fetch media:', error);
      toast.error(error.response?.data?.message || 'Failed to load media');
    } finally {
      setLoading(false);
    }
  }, [currentBrand, selectedType, selectedFolder, selectedTags, searchQuery, sortBy, sortOrder, page]);

  // ✅ Fetch popular tags
  const fetchTags = useCallback(async () => {
    if (!currentBrand) return;

    try {
      const response = await mediaApi.getTags(currentBrand._id);
      setPopularTags(response.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  }, [currentBrand]);

  // ✅ Fetch storage stats
  const fetchStats = useCallback(async () => {
    if (!currentBrand) return;

    try {
      const response = await mediaApi.getStats(currentBrand._id);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [currentBrand]);

  useEffect(() => {
    if (currentBrand) {
      fetchMedia();
      fetchFoldersMetadata();
      fetchTags();
      fetchStats();
    }
  }, [currentBrand, fetchMedia, fetchFoldersMetadata, fetchTags, fetchStats]);

  // ✅ Handle file upload
  const handleFileUpload = async (files: FileList, metadata: {
    folder?: string;
    tags?: string[];
    altText?: string;
    caption?: string;
  }) => {
    if (!currentBrand) {
      toast.error('Please select a brand first');
      return;
    }

    const fileArray = Array.from(files);
    
    const maxSize = 50 * 1024 * 1024;
    const invalidFiles = fileArray.filter(f => f.size > maxSize);
    
    if (invalidFiles.length > 0) {
      toast.error(`Some files exceed 50MB limit`);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await mediaApi.upload(fileArray, {
        brandId: currentBrand._id,
        folder: metadata.folder || 'uncategorized',
        tags: metadata.tags,
        altText: metadata.altText,
        caption: metadata.caption,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      toast.success(`Successfully uploaded ${response.data.length} file(s)`);
      
      setUploadDialogOpen(false);
      fetchMedia();
      fetchFoldersMetadata();
      fetchStats();
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ✅ Handle create folder
  const handleCreateFolder = async (name: string, description?: string) => {
    if (!currentBrand) return;

    try {
      await mediaApi.createFolder(currentBrand._id, { name, description });
      toast.success(`Folder "${name}" created successfully`);
      fetchFoldersMetadata();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create folder');
      throw error;
    }
  };

  // ✅ Handle rename folder
  const handleRenameFolder = async (oldName: string, newName: string) => {
    if (!currentBrand) return;

    try {
      await mediaApi.renameFolder(oldName, currentBrand._id, newName);
      toast.success(`Folder renamed to "${newName}"`);
      fetchFoldersMetadata();
      fetchMedia();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to rename folder');
      throw error;
    }
  };

  // ✅ Handle delete folder
  const handleDeleteFolder = async (folderName: string) => {
    if (!currentBrand) return;

    try {
      await mediaApi.deleteFolder(folderName, currentBrand._id);
      toast.success(`Folder "${folderName}" deleted`);
      fetchFoldersMetadata();
      fetchMedia();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete folder');
      throw error;
    }
  };

  // ✅ Handle edit metadata
  const handleEditMetadata = async (updates: {
    folder?: string;
    tags?: string[];
    altText?: string;
    caption?: string;
  }) => {
    if (!editingMedia || !currentBrand) return;

    try {
      await mediaApi.updateMetadata(editingMedia._id, currentBrand._id, updates);
      toast.success('Media updated successfully');
      setEditingMedia(null);
      fetchMedia();
      fetchFoldersMetadata();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update media');
    }
  };

  // ✅ Handle delete
  const handleDelete = async () => {
    if (!mediaToDelete || !currentBrand) return;

    try {
      await mediaApi.delete(mediaToDelete._id, currentBrand._id);
      toast.success('Media deleted successfully');
      setDeleteDialogOpen(false);
      setMediaToDelete(null);
      fetchMedia();
      fetchFoldersMetadata();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete media');
    }
  };

  // ✅ Handle bulk delete
  const handleBulkDelete = async () => {
    if (!currentBrand || selectedItems.size === 0) return;

    if (!confirm(`Delete ${selectedItems.size} selected items?`)) return;

    try {
      await mediaApi.bulkDelete(Array.from(selectedItems), currentBrand._id);
      toast.success(`Deleted ${selectedItems.size} items`);
      setSelectedItems(new Set());
      fetchMedia();
      fetchFoldersMetadata();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete items');
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (!currentBrand) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Brand Selected</AlertTitle>
          <AlertDescription className="mt-2">
            Please select a brand from the sidebar to access media library.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex gap-6 p-6">
      {/* ✅ LEFT SIDEBAR: Folder Navigation */}
      <div className="w-64 flex-shrink-0">
        <FolderSidebar
          folders={foldersMetadata}
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
          onManageFolders={() => setFolderManagementOpen(true)}
          loading={loadingFolders}
        />
      </div>

      {/* ✅ MAIN CONTENT */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <PageHeader
          title="Media Library"
          description="Manage your images and videos"
          actions={
            <div className="flex gap-2">
              {selectedItems.size > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedItems.size})
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setFolderManagementOpen(true)}
              >
                <FolderCog className="mr-2 h-4 w-4" />
                Manage Folders
              </Button>
              <Button variant="gradient" onClick={() => setUploadDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Media
              </Button>
            </div>
          }
        />

        {/* Storage Stats */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <HardDrive className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Storage</p>
                    <p className="text-2xl font-bold">{stats.totalSizeFormatted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Files</p>
                    <p className="text-2xl font-bold">{stats.totalFiles}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {stats.byType.map((type) => (
              <Card key={type.type}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "rounded-lg p-3",
                      type.type === 'image' ? 'bg-green-500/10' : 'bg-purple-500/10'
                    )}>
                      <ImageIcon className={cn(
                        "h-5 w-5",
                        type.type === 'image' ? 'text-green-500' : 'text-purple-500'
                      )} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground capitalize">{type.type}s</p>
                      <p className="text-2xl font-bold">{type.count}</p>
                      <p className="text-xs text-muted-foreground">{type.sizeFormatted}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filters - Same as before... */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={(v: any) => setSelectedType(v)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Upload Date</SelectItem>
                      <SelectItem value="filename">File Name</SelectItem>
                      <SelectItem value="size">File Size</SelectItem>
                      <SelectItem value="usageCount">Usage Count</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                  {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Badge
                key={tag.tag}
                variant={selectedTags.includes(tag.tag) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag.tag)
                      ? prev.filter(t => t !== tag.tag)
                      : [...prev, tag.tag]
                  );
                }}
              >
                <Tag className="mr-1 h-3 w-3" />
                {tag.tag} ({tag.count})
              </Badge>
            ))}
          </div>
        )}

        {/* Media Grid/List */}
        {loading ? (
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' ? 'md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'
          )}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className={viewMode === 'grid' ? 'h-64' : 'h-24'} />
            ))}
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No media uploaded yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Upload your first image or video</p>
            <Button className="mt-4" variant="gradient" onClick={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          </div>
        ) : (
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' ? 'md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'
          )}>
            {media.map((item) => (
              <MediaCard
                key={item._id}
                media={item}
                viewMode={viewMode}
                isSelected={selectedItems.has(item._id)}
                onToggleSelect={() => toggleSelection(item._id)}
                onPreview={() => setSelectedMedia(item)}
                onEdit={() => setEditingMedia(item)}
                onDelete={() => {
                  setMediaToDelete(item);
                  setDeleteDialogOpen(true);
                }}
                formatFileSize={formatFileSize}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* ✅ Dialogs */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleFileUpload}
        uploading={uploading}
        uploadProgress={uploadProgress}
        folders={folders}
        popularTags={popularTags.map(t => t.tag)}
      />

      <MediaPreviewDialog
        media={selectedMedia}
        onClose={() => setSelectedMedia(null)}
        onEdit={(media) => {
          setSelectedMedia(null);
          setEditingMedia(media);
        }}
        onDelete={(media) => {
          setSelectedMedia(null);
          setMediaToDelete(media);
          setDeleteDialogOpen(true);
        }}
        formatFileSize={formatFileSize}
      />

      <EditMetadataDialog
        media={editingMedia}
        onClose={() => setEditingMedia(null)}
        onSave={handleEditMetadata}
        folders={folders}
        popularTags={popularTags.map(t => t.tag)}
      />

      {/* ✅ Folder Management Dialog */}
      <FolderManagementDialog
        open={folderManagementOpen}
        onOpenChange={setFolderManagementOpen}
        folders={foldersMetadata}
        loading={loadingFolders}
        onCreateFolder={handleCreateFolder}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
        formatFileSize={formatFileSize}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Media</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{mediaToDelete?.originalName}"?
              {mediaToDelete && mediaToDelete.usageCount > 0 && (
                <p className="mt-2 text-destructive">
                  ⚠️ This media is used in {mediaToDelete.usageCount} post(s).
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}