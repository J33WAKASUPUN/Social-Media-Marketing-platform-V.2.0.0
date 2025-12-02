import React, { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Building2 } from 'lucide-react';

export const CreateOrganizationDialog: React.FC = () => {
  const { createOrganization } = useOrganization();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await createOrganization(formData);
    
    if (result) {
      setOpen(false);
      setFormData({ name: '', description: '' });
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <Building2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <DialogTitle className="text-foreground">Create Organization</DialogTitle>
                <DialogDescription>
                  Create a new organization to manage your social media accounts
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., My Company"
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your organization..."
                rows={3}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Describe what this organization is for.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'Creating...' : 'Create Organization'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};