import React, { useState, useEffect } from 'react';
import { useBrand } from '@/contexts/BrandContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Save, Plus } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { CreateBrandDialog } from './CreateBrandDialog';

export const BrandSettings: React.FC = () => {
  const { brands, currentBrand, setCurrentBrand, updateBrand, deleteBrand } = useBrand();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
  });
  const [loading, setLoading] = useState(false);

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
    if (!currentBrand) return;

    setLoading(true);
    await updateBrand(currentBrand._id, formData);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!currentBrand) return;
    await deleteBrand(currentBrand._id);
  };

  return (
    <div className="space-y-6">
      {/* Brand List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Brands</CardTitle>
              <CardDescription>Manage all your brands</CardDescription>
            </div>
            <CreateBrandDialog />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <Card
                key={brand._id}
                className={`cursor-pointer transition-colors ${
                  currentBrand?._id === brand._id ? 'border-primary' : ''
                }`}
                onClick={() => setCurrentBrand(brand)}
              >
                <CardHeader>
                  <CardTitle className="text-base">{brand.name}</CardTitle>
                  {brand.website && (
                    <CardDescription className="text-xs">{brand.website}</CardDescription>
                  )}
                </CardHeader>
                {currentBrand?._id === brand._id && (
                  <CardContent>
                    <Badge>Currently Selected</Badge>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Brand Details */}
      {currentBrand && (
        <Card>
          <CardHeader>
            <CardTitle>Brand Details</CardTitle>
            <CardDescription>Edit the selected brand information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input
                  id="brand-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand-description">Description</Label>
                <Textarea
                  id="brand-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-between">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Brand
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this
                        brand and all associated posts and channels.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
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
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};