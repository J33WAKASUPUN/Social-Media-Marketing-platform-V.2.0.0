import React, { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2, Save, Building2 } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OrganizationSelector } from '@/components/OrganizationSelector';
import { CreateOrganizationDialog } from '@/components/CreateOrganizationDialog';

export const OrganizationSettings: React.FC = () => {
  const { currentOrganization, updateOrganization, deleteOrganization } = useOrganization();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentOrganization) {
      setFormData({
        name: currentOrganization.name,
        description: currentOrganization.description || '',
      });
    }
  }, [currentOrganization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganization) return;

    setLoading(true);
    await updateOrganization(currentOrganization._id, formData);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!currentOrganization) return;
    await deleteOrganization(currentOrganization._id);
  };

  if (!currentOrganization) {
    return (
      <div className="space-y-4">
        {/* Organization Selector & Create Button */}
        <div className="flex items-center justify-between gap-4 p-4 bg-card rounded-lg border">
          <OrganizationSelector />
          <CreateOrganizationDialog />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>No organization selected</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Please select an organization from above or create a new one to manage its settings.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Organization Selector & Create Button */}
      <div className="flex items-center justify-between gap-4 p-4 bg-card rounded-lg border">
        <OrganizationSelector />
        <CreateOrganizationDialog />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Building2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-foreground">Organization Settings</CardTitle>
              <CardDescription>
                Manage your organization details and settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="org-name" className="text-foreground">Organization Name</Label>
              <Input
                id="org-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter organization name"
                required
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="org-description" className="text-foreground">Description</Label>
              <Textarea
                id="org-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your organization..."
                rows={3}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                A brief description of your organization's purpose.
              </p>
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Organization
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      organization and all associated data including brands, posts, and channels.
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};