import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrand } from '@/contexts/BrandContext';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TemplateCard,
  CreateTemplateDialog,
  SendTemplateDialog,
} from '@/components/whatsapp';
import { whatsappApi } from '@/services/whatsappApi';
import { channelApi } from '@/services/channelApi';
import type { WhatsAppTemplate, WhatsAppContact, Channel } from '@/types';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  AlertCircle,
  FileText,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

export default function WhatsAppTemplates() {
  const navigate = useNavigate();
  const { currentBrand } = useBrand();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [whatsappChannel, setWhatsappChannel] = useState<Channel | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'APPROVED' | 'PENDING' | 'REJECTED'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'>('all');

  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null);

  useEffect(() => {
    if (currentBrand) {
      loadData();
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

      // Get templates
      const templatesRes = await whatsappApi.getTemplates(currentBrand._id);
      setTemplates(templatesRes.data);

      // Get contacts (for sending)
      const contactsRes = await whatsappApi.getContacts(currentBrand._id);
      setContacts(contactsRes.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (data: any) => {
    if (!currentBrand) return;

    try {
      await whatsappApi.createTemplate(currentBrand._id, data);
      toast.success('Template created and submitted for approval');
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create template');
      throw error;
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await whatsappApi.deleteTemplate(currentBrand._id, templateId);
      toast.success('Template deleted');
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleSendTemplate = async (data: {
    templateName: string;
    languageCode: string;
    recipientIds: string[];
  }) => {
    if (!currentBrand) return;

    try {
      await whatsappApi.sendTemplate(currentBrand._id, data);
      toast.success(`Template sent to ${data.recipientIds.length} contacts`);
      setShowSendDialog(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send template');
      throw error;
    }
  };

  const handlePreview = (template: WhatsAppTemplate) => {
    setPreviewTemplate(template);
    // Could open a preview dialog here
    toast.info('Preview feature coming soon');
  };

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Stats
  const stats = {
    total: templates.length,
    approved: templates.filter((t) => t.status === 'APPROVED').length,
    pending: templates.filter((t) => t.status === 'PENDING').length,
    rejected: templates.filter((t) => t.status === 'REJECTED').length,
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
        title="WhatsApp Templates"
        description="Create and manage message templates for WhatsApp Business"
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <FileText className="h-4 w-4" />
            Total Templates
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mb-1">
            <CheckCircle className="h-4 w-4" />
            Approved
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.approved}
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 mb-1">
            <Clock className="h-4 w-4" />
            Pending
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.pending}
          </p>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mb-1">
            <XCircle className="h-4 w-4" />
            Rejected
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.rejected}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="MARKETING">Marketing</SelectItem>
            <SelectItem value="UTILITY">Utility</SelectItem>
            <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No templates found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first WhatsApp template'}
          </p>
          {!searchQuery && statusFilter === 'all' && categoryFilter === 'all' && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template._id}
              template={template}
              onSend={(t) => {
                setSelectedTemplate(t);
                setShowSendDialog(true);
              }}
              onDelete={handleDeleteTemplate}
              onPreview={handlePreview}
            />
          ))}
        </div>
      )}

      {/* Create Template Dialog */}
      <CreateTemplateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateTemplate}
        channelId={whatsappChannel?._id || ''}
      />

      {/* Send Template Dialog */}
      <SendTemplateDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        template={selectedTemplate}
        contacts={contacts}
        onSend={handleSendTemplate}
      />
    </div>
  );
}