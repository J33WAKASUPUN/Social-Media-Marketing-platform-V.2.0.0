import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FolderOpen,
  HardDrive,
  FileImage,
  FileVideo,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import type { MediaStats } from '@/services/mediaApi';
import { cn } from '@/lib/utils';

interface MediaTabProps {
  mediaStats: MediaStats | null;
  storagePercentage: number;
  formatStorageUsed: (bytes: number) => string;
  onRefresh: () => void;
}

const MAX_STORAGE_BYTES = 1024 * 1024 * 1024 * 1024; // 1TB

export function MediaTab({ mediaStats, storagePercentage, formatStorageUsed, onRefresh }: MediaTabProps) {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Storage */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6"> {/* Increased padding */}
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-purple-500/10 p-4"> {/* Bigger icon box */}
                <HardDrive className="h-6 w-6 text-purple-600" /> {/* Bigger icon */}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Storage</p>
                <p className="text-3xl font-bold">{formatStorageUsed(mediaStats?.totalSize || 0)}</p> {/* Bigger text */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Files */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-500/10 p-4">
                <FolderOpen className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                <p className="text-3xl font-bold">{mediaStats?.totalFiles || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images Stats */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-green-500/10 p-4">
                <FileImage className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Images</p>
                <p className="text-3xl font-bold">
                  {mediaStats?.byType?.find(t => t.type === 'image')?.count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Videos Stats */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-orange-500/10 p-4">
                <FileVideo className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Videos</p>
                <p className="text-3xl font-bold">
                  {mediaStats?.byType?.find(t => t.type === 'video')?.count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage Details Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Storage Analysis
              </CardTitle>
              <CardDescription>
                Detailed breakdown of your media storage usage
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Storage Progress Bar - Updated Colors */}
          <div className="mb-8 p-6 rounded-lg bg-muted/30 border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-purple-600" />
                Storage Usage
              </span>
              <span className="text-sm font-medium text-foreground">
                {formatStorageUsed(mediaStats?.totalSize || 0)} / 1 TB
              </span>
            </div>
            
            {/* Progress Track (Gray) */}
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              {/* Progress Indicator (Purple) */}
              <div 
                className="h-full bg-purple-600 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.max(Math.min(storagePercentage, 100), 0.1)}%` }}
              />
            </div>
            
            <p className="text-xs text-muted-foreground mt-3 text-right font-medium">
              {storagePercentage.toFixed(4)}% used
            </p>
          </div>

          {/* Breakdown List */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">File Types</h4>
            
            {/* Images Row */}
            {(() => {
              const imageData = mediaStats?.byType?.find(t => t.type === 'image');
              const imageSize = imageData?.size || 0;
              const imagePercentageOf1TB = (imageSize / MAX_STORAGE_BYTES) * 100;
              
              return (
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <FileImage className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Images</div>
                      <div className="text-xs text-muted-foreground">
                        {imageData?.count || 0} files • {imageData?.sizeFormatted || formatStorageUsed(imageSize)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <div className="font-medium">
                      {imagePercentageOf1TB.toFixed(3)}%
                    </div>
                    {/* Small breakdown bar */}
                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mt-1 ml-auto">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${Math.max(Math.min(imagePercentageOf1TB * 100, 100), 0.5)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Videos Row */}
            {(() => {
              const videoData = mediaStats?.byType?.find(t => t.type === 'video');
              const videoSize = videoData?.size || 0;
              const videoPercentageOf1TB = (videoSize / MAX_STORAGE_BYTES) * 100;
              
              return (
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <FileVideo className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium">Videos</div>
                      <div className="text-xs text-muted-foreground">
                        {videoData?.count || 0} files • {videoData?.sizeFormatted || formatStorageUsed(videoSize)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <div className="font-medium">
                      {videoPercentageOf1TB.toFixed(3)}%
                    </div>
                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mt-1 ml-auto">
                      <div 
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${Math.max(Math.min(videoPercentageOf1TB * 100, 100), 0.5)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Empty State */}
          {(!mediaStats || mediaStats.totalFiles === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <FolderOpen className="mx-auto h-12 w-12 mb-3 opacity-20" />
              <p>No media files found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}