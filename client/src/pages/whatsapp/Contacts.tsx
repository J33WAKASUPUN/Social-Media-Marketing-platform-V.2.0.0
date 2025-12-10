import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBrand } from '@/contexts/BrandContext';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ContactCard } from '@/components/whatsapp';
import { whatsappApi } from '@/services/whatsappApi';
import { channelApi } from '@/services/channelApi';
import type { WhatsAppContact, Channel } from '@/types';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  AlertCircle,
  Users,
  Download,
  Upload,
  Filter,
  X,
  UserPlus,
  Tag as TagIcon,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WhatsAppContacts() {
  const navigate = useNavigate();
  const { currentBrand } = useBrand();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [whatsappChannel, setWhatsappChannel] = useState<Channel | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [optInFilter, setOptInFilter] = useState<'all' | 'opted_in' | 'opted_out'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);

  // Create/Edit Dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<WhatsAppContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    tags: [] as string[],
    groups: [] as string[],
    notes: '',
    optedIn: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [groupInput, setGroupInput] = useState('');

  useEffect(() => {
    if (currentBrand) {
      loadData();
    }

    // Check if edit param is present
    const editId = searchParams.get('edit');
    if (editId) {
      // Will open edit dialog after contacts are loaded
    }
  }, [currentBrand]);

  const loadData = async () => {
    if (!currentBrand) return;

    try {
      setLoading(true);

      // Get WhatsApp channel
      const channelsRes = await channelApi.getAll(currentBrand._id);
      const whatsappCh = channelsRes.data.find((ch) => ch.provider === 'whatsapp');

      if (!whatsappCh) {
        toast.error('No WhatsApp channel connected');
        navigate('/channels');
        return;
      }

      setWhatsappChannel(whatsappCh);

      // Get contacts
      const contactsRes = await whatsappApi.getContacts(currentBrand._id);
      setContacts(contactsRes.data);

      // Extract unique tags and groups
      const allTags = new Set<string>();
      const allGroups = new Set<string>();
      contactsRes.data.forEach((contact) => {
        contact.tags.forEach((tag) => allTags.add(tag));
        contact.groups.forEach((group) => allGroups.add(group));
      });
      setAvailableTags(Array.from(allTags));
      setAvailableGroups(Array.from(allGroups));

      // Check if we should open edit dialog
      const editId = searchParams.get('edit');
      if (editId) {
        const contactToEdit = contactsRes.data.find((c) => c._id === editId);
        if (contactToEdit) {
          handleEdit(contactToEdit);
        }
        // Clear search params
        setSearchParams({});
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async () => {
    if (!currentBrand) return;

    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }

    // Validate phone format (basic E.164 check)
    if (!formData.phone.match(/^\+[1-9]\d{1,14}$/)) {
      toast.error('Phone must be in E.164 format (e.g., +14155552671)');
      return;
    }

    try {
      if (editingContact) {
        await whatsappApi.updateContact(currentBrand._id, editingContact._id, formData);
        toast.success('Contact updated');
      } else {
        await whatsappApi.createContact(currentBrand._id, formData);
        toast.success('Contact created');
      }

      setShowCreateDialog(false);
      resetForm();
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save contact');
    }
  };

  const handleEdit = (contact: WhatsAppContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      tags: contact.tags,
      groups: contact.groups,
      notes: contact.notes || '',
      optedIn: contact.optedIn,
    });
    setShowCreateDialog(true);
  };

  const handleDelete = async (contactId: string) => {
    if (!currentBrand) return;
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      await whatsappApi.deleteContact(currentBrand._id, contactId);
      toast.success('Contact deleted');
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete contact');
    }
  };

  const resetForm = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      tags: [],
      groups: [],
      notes: '',
      optedIn: false,
    });
    setTagInput('');
    setGroupInput('');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleAddGroup = () => {
    if (groupInput.trim() && !formData.groups.includes(groupInput.trim())) {
      setFormData({ ...formData, groups: [...formData.groups, groupInput.trim()] });
      setGroupInput('');
    }
  };

  const handleRemoveGroup = (group: string) => {
    setFormData({ ...formData, groups: formData.groups.filter((g) => g !== group) });
  };

  // Filter contacts
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesOptIn =
      optInFilter === 'all' ||
      (optInFilter === 'opted_in' && contact.optedIn) ||
      (optInFilter === 'opted_out' && !contact.optedIn);

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => contact.tags.includes(tag));

    const matchesGroups =
      selectedGroups.length === 0 ||
      selectedGroups.some((group) => contact.groups.includes(group));

    return matchesSearch && matchesOptIn && matchesTags && matchesGroups;
  });

  // Stats
  const stats = {
    total: contacts.length,
    optedIn: contacts.filter((c) => c.optedIn).length,
    optedOut: contacts.filter((c) => !c.optedIn).length,
  };

  if (!currentBrand) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Brand Selected</AlertTitle>
          <AlertDescription>
            Please select a brand from the sidebar.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="WhatsApp Contacts"
        description="Manage your WhatsApp contacts and customer database"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            Total Contacts
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mb-1">
            <CheckCircle className="h-4 w-4" />
            Opted In
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.optedIn}
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mb-1">
            <XCircle className="h-4 w-4" />
            Opted Out
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.optedOut}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={optInFilter} onValueChange={(value: any) => setOptInFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="opted_in">Opted In</SelectItem>
            <SelectItem value="opted_out">Opted Out</SelectItem>
          </SelectContent>
        </Select>

        {availableTags.length > 0 && (
          <Select
            value={selectedTags.length > 0 ? selectedTags[0] : 'all'}
            onValueChange={(value) =>
              setSelectedTags(value === 'all' ? [] : [value])
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {availableTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {(searchQuery || optInFilter !== 'all' || selectedTags.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setOptInFilter('all');
              setSelectedTags([]);
              setSelectedGroups([]);
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Contacts Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No contacts found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || optInFilter !== 'all' || selectedTags.length > 0
              ? 'Try adjusting your filters'
              : 'Add your first contact to get started'}
          </p>
          {!searchQuery && optInFilter === 'all' && selectedTags.length === 0 && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((contact) => (
            <div
              key={contact._id}
              className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
            >
              {/* Contact Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                    {contact.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.phone}</p>
                  </div>
                </div>
                <Badge variant={contact.optedIn ? 'default' : 'secondary'} className="text-xs">
                  {contact.optedIn ? 'Opted In' : 'Opted Out'}
                </Badge>
              </div>

              {/* Email */}
              {contact.email && (
                <p className="text-sm text-muted-foreground mb-2">{contact.email}</p>
              )}

              {/* Tags */}
              {contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {contact.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(contact)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(contact._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Edit Contact' : 'Add New Contact'}
            </DialogTitle>
            <DialogDescription>
              {editingContact
                ? 'Update contact information'
                : 'Add a new contact to your WhatsApp database'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="+14155552671"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!!editingContact}
                required
              />
              <p className="text-xs text-muted-foreground">
                E.164 format (e.g., +14155552671)
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Groups */}
            <div className="space-y-2">
              <Label>Groups</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add group..."
                  value={groupInput}
                  onChange={(e) => setGroupInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGroup())}
                />
                <Button type="button" variant="outline" onClick={handleAddGroup}>
                  Add
                </Button>
              </div>
              {formData.groups.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.groups.map((group) => (
                    <Badge key={group} variant="secondary" className="gap-1">
                      {group}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveGroup(group)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            {/* Opt-in Status */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="optedIn"
                checked={formData.optedIn}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, optedIn: !!checked })
                }
              />
              <Label htmlFor="optedIn" className="cursor-pointer">
                Contact has opted in to receive messages
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateContact}>
              {editingContact ? 'Update Contact' : 'Create Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}