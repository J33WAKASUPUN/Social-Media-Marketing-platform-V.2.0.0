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
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
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

// Import folder components
import {
  MediaCard,
  UploadDialog,
  MediaPreviewDialog,
  EditMetadataDialog,
  FolderManagementDialog,
  FolderSidebar,
} from '@/components/media';

interface FolderMetadata {
  name: string;
  mediaCount: number;
  totalSize: number;
  totalSizeFormatted: string;
  lastUpdated: string;
}

// Define props for the new reusable component
interface MediaLibraryProps {
  brandId: string;
  isDialogMode?: boolean;
  initialSelectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function MediaLibrary({
  brandId,
  isDialogMode = false,
  initialSelectedIds = [],
  onSelectionChange,
  initialMediaTypeFilter = 'all',
}: MediaLibraryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
   const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video'>(initialMediaTypeFilter);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'createdAt' | 'size' | 'filename' | 'usageCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [foldersMetadata, setFoldersMetadata] = useState<FolderMetadata[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [folderManagementOpen, setFolderManagementOpen] = useState(false);
  
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(initialSelectedIds));
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);

  // Update filter when prop changes
  useEffect(() => {
    setSelectedType(initialMediaTypeFilter);
  }, [initialMediaTypeFilter]);

  const fetchFoldersMetadata = useCallback(async () => {
    try {
      setLoadingFolders(true);
      const response = await mediaApi.getFoldersMetadata(brandId);
      setFoldersMetadata(response.data);
    } catch (error) {
      console.error('Failed to fetch folders metadata:', error);
    } finally {
      setLoadingFolders(false);
    }
  }, [brandId]);

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const response = await mediaApi.getAll({
        brandId,
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
  }, [brandId, selectedType, selectedFolder, selectedTags, searchQuery, sortBy, sortOrder, page]);

  const fetchTags = useCallback(async () => {
    try {
      const response = await mediaApi.getTags(brandId);
      setPopularTags(response.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  }, [brandId]);

  const fetchStats = useCallback(async () => {
    if (isDialogMode) return; // Don't fetch stats in dialog mode
    try {
      const response = await mediaApi.getStats(brandId);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [brandId, isDialogMode]);

  useEffect(() => {
    fetchMedia();
    fetchFoldersMetadata();
    fetchTags();
    fetchStats();
  }, [fetchMedia, fetchFoldersMetadata, fetchTags, fetchStats]);

  const handleFileUpload = async (files: FileList, metadata: {
    folder?: string;
    tags?: string[];
    altText?: string;
    caption?: string;
  }) => {
    const fileArray = Array.from(files);
    
    const maxSize = 50 * 1024 * 1024;
    if (fileArray.some(f => f.size > maxSize)) {
      toast.error(`Some files exceed 50MB limit`);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      const progressInterval = setInterval(() => setUploadProgress(prev => Math.min(prev + 10, 90)), 200);

      const response = await mediaApi.upload(fileArray, {
        brandId,
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
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCreateFolder = async (name: string, description?: string) => {
    try {
      await mediaApi.createFolder(brandId, { name, description });
      toast.success(`Folder "${name}" created successfully`);
      fetchFoldersMetadata();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create folder');
      throw error;
    }
  };

  const handleRenameFolder = async (oldName: string, newName: string) => {
    try {
      await mediaApi.renameFolder(oldName, brandId, newName);
      toast.success(`Folder renamed to "${newName}"`);
      fetchFoldersMetadata();
      fetchMedia();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to rename folder');
      throw error;
    }
  };

  const handleDeleteFolder = async (folderName: string) => {
    try {
      await mediaApi.deleteFolder(folderName, brandId);
      toast.success(`Folder "${folderName}" deleted`);
      fetchFoldersMetadata();
      fetchMedia();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete folder');
      throw error;
    }
  };

  const handleEditMetadata = async (updates: {
    folder?: string;
    tags?: string[];
    altText?: string;
    caption?: string;
  }) => {
    if (!editingMedia) return;
    try {
      await mediaApi.updateMetadata(editingMedia._id, brandId, updates);
      toast.success('Media updated successfully');
      setEditingMedia(null);
      fetchMedia();
      fetchFoldersMetadata();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update media');
    }
  };

  const handleDelete = async () => {
    if (!mediaToDelete) return;
    try {
      await mediaApi.delete(mediaToDelete._id, brandId);
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

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`Delete ${selectedItems.size} selected items?`)) return;
    try {
      await mediaApi.bulkDelete(Array.from(selectedItems), brandId);
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
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSet));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className={cn("flex gap-6", !isDialogMode && "p-6")}>
      <div className="w-64 flex-shrink-0">
        <FolderSidebar
          folders={foldersMetadata}
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
          onManageFolders={() => setFolderManagementOpen(true)}
          loading={loadingFolders}
        />
      </div>

      <div className="flex-1 space-y-6">
        {!isDialogMode && (
          <>
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
                  <Button variant="outline" onClick={() => setFolderManagementOpen(true)}>
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
            {stats && (
              <div className="grid gap-4 md:grid-cols-4">
                {/* Stats cards */}
              </div>
            )}
          </>
        )}

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
            {/* ✅ UPDATED: Disable type filter if locked to specific type */}
            <Select 
              value={selectedType} 
              onValueChange={(v: any) => setSelectedType(v)}
              disabled={initialMediaTypeFilter !== 'all'} // ✅ Lock filter if passed from parent
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>
            
            {/* ✅ SHOW LOCKED FILTER INDICATOR */}
            {initialMediaTypeFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Filtered by platform
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Sorting options */}
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

        {loading ? (
          <div className={cn("grid gap-4", viewMode === 'grid' ? 'md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1')}>
            {[...Array(8)].map((_, i) => <Skeleton key={i} className={viewMode === 'grid' ? 'h-64' : 'h-24'} />)}
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              {initialMediaTypeFilter === 'video' ? 'No videos found' : 
               initialMediaTypeFilter === 'image' ? 'No images found' : 
               'No media found'}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {initialMediaTypeFilter === 'video' ? 'Upload videos to get started' :
               initialMediaTypeFilter === 'image' ? 'Upload images to get started' :
               'Try adjusting your filters or upload new media.'}
            </p>
          </div>
        ) : (
          <div className={cn("grid gap-4", viewMode === 'grid' ? 'md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1')}>
            {media.map((item) => (
              <MediaCard
                key={item._id}
                media={item}
                viewMode={viewMode}
                isSelected={selectedItems.has(item._id)}
                onToggleSelect={() => toggleSelection(item._id)}
                onPreview={() => setSelectedMedia(item)}
                onEdit={() => setEditingMedia(item)}
                onDelete={() => { setMediaToDelete(item); setDeleteDialogOpen(true); }}
                formatFileSize={formatFileSize}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {/* Pagination buttons */}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleFileUpload}
        uploading={uploading}
        uploadProgress={uploadProgress}
        folders={foldersMetadata.map(f => f.name)}
        popularTags={popularTags.map(t => t.tag)}
      />
      <MediaPreviewDialog
        media={selectedMedia}
        onClose={() => setSelectedMedia(null)}
        onEdit={(m) => { setSelectedMedia(null); setEditingMedia(m); }}
        onDelete={(m) => { setSelectedMedia(null); setMediaToDelete(m); setDeleteDialogOpen(true); }}
        formatFileSize={formatFileSize}
      />
      <EditMetadataDialog
        media={editingMedia}
        onClose={() => setEditingMedia(null)}
        onSave={handleEditMetadata}
        folders={foldersMetadata.map(f => f.name)}
        popularTags={popularTags.map(t => t.tag)}
      />
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
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        {/* Delete confirmation dialog */}
      </Dialog>
    </div>
  );
}
