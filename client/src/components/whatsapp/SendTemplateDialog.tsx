import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WhatsAppTemplate, WhatsAppContact } from '@/types';
import { Search, Users, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SendTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WhatsAppTemplate | null;
  contacts: WhatsAppContact[];
  onSend: (data: {
    templateName: string;
    languageCode: string;
    recipientIds: string[];
  }) => Promise<void>;
}

export function SendTemplateDialog({
  open,
  onOpenChange,
  template,
  contacts,
  onSend,
}: SendTemplateDialogProps) {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter contacts by search
  const filteredContacts = contacts.filter(contact => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.phone.includes(query)
    );
  });

  // Filter opted-in contacts only
  const eligibleContacts = filteredContacts.filter(c => c.optedIn);

  const handleToggleContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleToggleAll = () => {
    if (selectedContacts.length === eligibleContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(eligibleContacts.map(c => c._id));
    }
  };

  const handleSend = async () => {
    if (!template) return;

    if (selectedContacts.length === 0) {
      toast.error('Please select at least one contact');
      return;
    }

    setLoading(true);
    try {
      await onSend({
        templateName: template.name,
        languageCode: template.language,
        recipientIds: selectedContacts,
      });
      
      onOpenChange(false);
      setSelectedContacts([]);
      setSearchQuery('');
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  if (!template) return null;

  // Get template preview
  const getTemplatePreview = () => {
    const components = template.components;
    const header = components.find(c => c.type === 'HEADER');
    const body = components.find(c => c.type === 'BODY');
    const footer = components.find(c => c.type === 'FOOTER');

    return { header, body, footer };
  };

  const preview = getTemplatePreview();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Template: {template.name}
          </DialogTitle>
          <DialogDescription>
            Select contacts to send this template message to. Only opted-in contacts are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* LEFT: Template Preview */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Template Preview</h3>
            
            <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
              {/* Header */}
              {preview.header && (
                <div className="font-semibold text-sm">
                  {preview.header.format === 'TEXT' && preview.header.text}
                  {preview.header.format === 'IMAGE' && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-2xl">🖼️</span>
                      <span className="text-xs">Image</span>
                    </div>
                  )}
                  {preview.header.format === 'VIDEO' && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-2xl">🎥</span>
                      <span className="text-xs">Video</span>
                    </div>
                  )}
                  {preview.header.format === 'DOCUMENT' && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-2xl">📄</span>
                      <span className="text-xs">Document</span>
                    </div>
                  )}
                </div>
              )}

              {/* Body */}
              {preview.body && (
                <div className="text-sm whitespace-pre-wrap">
                  {preview.body.text}
                </div>
              )}

              {/* Footer */}
              {preview.footer && (
                <div className="text-xs text-muted-foreground border-t pt-2">
                  {preview.footer.text}
                </div>
              )}

              {/* Buttons */}
              {template.components.find(c => c.type === 'BUTTONS')?.buttons && (
                <div className="space-y-1 pt-2">
                  {template.components
                    .find(c => c.type === 'BUTTONS')
                    ?.buttons?.map((button, i) => (
                      <div
                        key={i}
                        className="text-center text-sm text-blue-600 border rounded py-1.5 cursor-pointer hover:bg-accent"
                      >
                        {button.text}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Category:</span>
                <Badge variant="outline">{template.category}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Language:</span>
                <Badge variant="outline">{template.language.toUpperCase()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {template.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* RIGHT: Contact Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Select Recipients</h3>
              <Badge variant="secondary">
                {selectedContacts.length} / {eligibleContacts.length} selected
              </Badge>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Select All */}
            {eligibleContacts.length > 0 && (
              <div className="flex items-center gap-2 pb-2 border-b">
                <Checkbox
                  id="select-all"
                  checked={selectedContacts.length === eligibleContacts.length}
                  onCheckedChange={handleToggleAll}
                />
                <Label htmlFor="select-all" className="cursor-pointer">
                  Select All ({eligibleContacts.length})
                </Label>
              </div>
            )}

            {/* Contacts List */}
            <ScrollArea className="h-[300px] rounded-md border">
              {eligibleContacts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No eligible contacts found</p>
                  <p className="text-xs mt-1">Contacts must be opted-in to receive templates</p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {eligibleContacts.map((contact) => (
                    <div
                      key={contact._id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => handleToggleContact(contact._id)}
                    >
                      <Checkbox
                        checked={selectedContacts.includes(contact._id)}
                        onCheckedChange={() => handleToggleContact(contact._id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.phone}</p>
                      </div>
                      {contact.tags.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {contact.tags[0]}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Warning for marketing templates */}
            {template.category === 'MARKETING' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Marketing templates can only be sent to contacts who have opted-in to receive messages.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading || selectedContacts.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to {selectedContacts.length} {selectedContacts.length === 1 ? 'Contact' : 'Contacts'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}