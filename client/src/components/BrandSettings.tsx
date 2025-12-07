import React, { useState, useEffect } from 'react';
import { useBrand } from '@/contexts/BrandContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Save, Tag, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateBrandDialog } from '@/components/CreateBrandDialog';

export const BrandSettings: React.FC = () => {
  const { brands, currentBrand, setCurrentBrand, updateBrand, deleteBrand } = useBrand();
  const permissions = usePermissions();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
  });
  const [loading, setLoading] = useState(false);

  // Only owner can edit, delete, and create brands
  const canEdit = permissions.isOwner;
  const canDelete = permissions.isOwner;
  const canCreate = permissions.isOwner;

  useEffect(() => {
    if (currentBrand) {
      setFormData({
        name: currentBrand.name,
        description: currentBrand.description || '',
        website: currentBrand.website || '',
      });
    }
  }, [currentBrand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBrand || !canEdit) return;

    setLoading(true);
    await updateBrand(currentBrand._id, formData);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!currentBrand || !canDelete) return;
    await deleteBrand(currentBrand._id);
  };

  return (
    <div className="space-y-6">
      {/* Brand Selector & Create Button */}
      <div className="flex items-center justify-between gap-4 p-4 bg-card rounded-lg border">
        <div className="flex-1">
          <Label className="text-sm font-medium mb-2 block">Select Brand</Label>
          <Select
            value={currentBrand?._id || ''}
            onValueChange={(value) => {
              const brand = brands.find(b => b._id === value);
              setCurrentBrand(brand || null);
            }}
          >
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Select a brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand._id} value={brand._id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canCreate && <CreateBrandDialog />}
      </div>

      {/* Read-only notice for non-owners */}
      {!canEdit && currentBrand && (
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertTitle>View Only</AlertTitle>
          <AlertDescription>
            You don't have permission to edit brand settings. 
            Only the organization owner can make changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Brand Settings Form */}
      {currentBrand && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <Tag className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <CardTitle>Brand Settings</CardTitle>
                <CardDescription>
                  {canEdit 
                    ? 'Manage your brand details'
                    : 'View brand details'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input
                  id="brand-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter brand name"
                  required
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-description">Description</Label>
                <Textarea
                  id="brand-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your brand..."
                  rows={3}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-website">Website</Label>
                <Input
                  id="brand-website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  disabled={!canEdit}
                />
              </div>

              {/* Only show action buttons if user is owner */}
              {canEdit && (
                <div className="flex justify-between pt-4 border-t">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Brand
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Brand?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this brand and all associated
                          posts, channels, and media. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button type="submit" disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {!currentBrand && (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Brand Selected</h3>
            <p className="text-muted-foreground mb-4">
              Select a brand from above to view or edit its settings.
            </p>
            {canCreate && <CreateBrandDialog />}
          </CardContent>
        </Card>
      )}
    </div>
  );
};