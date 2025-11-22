import { useBrand } from '@/contexts/BrandContext';
import { MediaLibrary } from '@/components/media/MediaLibrary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function MediaPage() {
  const { currentBrand } = useBrand();

  if (!currentBrand) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Brand Selected</AlertTitle>
          <AlertDescription className="mt-2">
            Please select a brand from the sidebar to access the media library.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <MediaLibrary brandId={currentBrand._id} />;
}