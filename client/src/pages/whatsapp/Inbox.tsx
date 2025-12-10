import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrand } from '@/contexts/BrandContext';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChatList,
  MessageList,
  MessageInput,
  ContactDetailsPanel,
  SendTemplateDialog,
} from '@/components/whatsapp';
import { whatsappApi } from '@/services/whatsappApi';
import { channelApi } from '@/services/channelApi';
import type { WhatsAppContact, WhatsAppMessage, WhatsAppTemplate, Channel } from '@/types';
import { toast } from 'sonner';
import {
  MessageCircle,
  AlertCircle,
  Send,
  Info,
  Filter,
  Users,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WhatsAppInbox() {
  const navigate = useNavigate();
  const { currentBrand } = useBrand();

  // State
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // WhatsApp channel
  const [whatsappChannel, setWhatsappChannel] = useState<Channel | null>(null);

  // Template sending
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [showSendTemplate, setShowSendTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);

  // Contact details panel
  const [showContactDetails, setShowContactDetails] = useState(false);

  // Filters
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);

  // Last messages cache (for chat list preview)
  const [lastMessages, setLastMessages] = useState<Record<string, WhatsAppMessage>>({});

  // Load WhatsApp channel and contacts
  useEffect(() => {
    if (currentBrand) {
      loadData();
    }
  }, [currentBrand]);

  const loadData = async () => {
    if (!currentBrand) return;

    try {
      setLoading(true);

      // 1. Get WhatsApp channel
      const channelsRes = await channelApi.getAll(currentBrand._id);
      const whatsappCh = channelsRes.data.find((ch) => ch.provider === 'whatsapp');

      if (!whatsappCh) {
        toast.error('No WhatsApp channel connected');
        navigate('/channels');
        return;
      }

      setWhatsappChannel(whatsappCh);

      // 2. Get contacts
      const contactsRes = await whatsappApi.getContacts(currentBrand._id);
      setContacts(contactsRes.data);

      // 3. Extract unique tags and groups
      const allTags = new Set<string>();
      const allGroups = new Set<string>();
      contactsRes.data.forEach((contact) => {
        contact.tags.forEach((tag) => allTags.add(tag));
        contact.groups.forEach((group) => allGroups.add(group));
      });
      setAvailableTags(Array.from(allTags));
      setAvailableGroups(Array.from(allGroups));

      // 4. Get templates
      const templatesRes = await whatsappApi.getTemplates(currentBrand._id);
      setTemplates(templatesRes.data);

      // 5. Load last messages for each contact
      await loadLastMessages(contactsRes.data);
    } catch (error: any) {
      console.error('Failed to load inbox:', error);
      toast.error(error.response?.data?.message || 'Failed to load inbox');
    } finally {
      setLoading(false);
    }
  };

  const loadLastMessages = async (contactsList: WhatsAppContact[]) => {
    if (!currentBrand) return;

    try {
      // Get recent messages for all contacts
      const messagesRes = await whatsappApi.getMessages(currentBrand._id, {
        limit: 100,
      });

      // Group by contact phone
      const messagesByContact: Record<string, WhatsAppMessage> = {};
      messagesRes.data.forEach((msg) => {
        const phone = msg.direction === 'inbound' ? msg.from : msg.to;
        if (!messagesByContact[phone] || new Date(msg.timestamp) > new Date(messagesByContact[phone].timestamp)) {
          messagesByContact[phone] = msg;
        }
      });

      setLastMessages(messagesByContact);
    } catch (error) {
      console.error('Failed to load last messages:', error);
    }
  };

  const loadMessages = async (contact: WhatsAppContact) => {
    if (!currentBrand) return;

    try {
      setMessagesLoading(true);
      const res = await whatsappApi.getMessages(currentBrand._id, {
        contactPhone: contact.phone,
      });
      setMessages(res.data);
    } catch (error: any) {
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleContactSelect = (contact: WhatsAppContact) => {
    setSelectedContact(contact);
    loadMessages(contact);
    setShowContactDetails(false);
  };

  const handleSendText = async (text: string) => {
    if (!selectedContact || !currentBrand) return;

    try {
      setSending(true);
      await whatsappApi.sendMessage(currentBrand._id, {
        to: selectedContact.phone,
        type: 'text',
        text,
      });

      // Reload messages
      await loadMessages(selectedContact);
      toast.success('Message sent');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSendMedia = async (
    file: File,
    type: 'image' | 'video' | 'audio' | 'document',
    caption?: string
  ) => {
    if (!selectedContact || !currentBrand) return;

    try {
      setSending(true);

      // Create FormData
      const formData = new FormData();
      formData.append('to', selectedContact.phone);
      formData.append('type', type);
      formData.append('media', file);
      if (caption) formData.append('caption', caption);

      await whatsappApi.sendMediaMessage(currentBrand._id, formData);

      // Reload messages
      await loadMessages(selectedContact);
      toast.success('Media sent');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send media');
    } finally {
      setSending(false);
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
      setShowSendTemplate(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send template');
    }
  };

  if (!currentBrand) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Brand Selected</AlertTitle>
          <AlertDescription>
            Please select a brand from the sidebar to access WhatsApp inbox.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="border-b p-4">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex-1 flex">
          <div className="w-80 border-r p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
          <div className="flex-1 flex flex-col">
            <Skeleton className="h-16 border-b" />
            <div className="flex-1 p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={cn(
                    'h-12 w-64 rounded-lg',
                    i % 2 === 0 ? 'ml-auto' : 'mr-auto'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!whatsappChannel) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>WhatsApp Not Connected</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>Connect your WhatsApp Business account to start messaging.</p>
            <Button onClick={() => navigate('/channels')}>
              Connect WhatsApp
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-green-600" />
            <div>
              <h1 className="text-xl font-bold">WhatsApp Inbox</h1>
              <p className="text-sm text-muted-foreground">
                {contacts.length} contacts • {messages.length} messages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/whatsapp/templates')}
            >
              <Send className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/whatsapp/contacts')}
            >
              <Users className="h-4 w-4 mr-2" />
              Contacts
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat List */}
        <div className="w-80 border-r bg-card overflow-y-auto">
          <ChatList
            contacts={contacts}
            selectedContact={selectedContact}
            onSelectContact={handleContactSelect}
            loading={false}
            lastMessages={lastMessages}
            onFilterChange={(filters) => {
              setSelectedTags(filters.tags);
              setSelectedGroups(filters.groups);
            }}
            availableTags={availableTags}
            availableGroups={availableGroups}
          />
        </div>

        {/* Center: Messages */}
        <div className="flex-1 flex flex-col">
          {selectedContact ? (
            <>
              {/* Contact Header */}
              <div className="border-b p-4 bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                    {selectedContact.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedContact.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedContact.phone}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowContactDetails(true)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <MessageList
                messages={messages}
                loading={messagesLoading}
                currentUserPhone={whatsappChannel.providerData?.phoneNumber}
              />

              {/* Input */}
              <MessageInput
                onSendText={handleSendText}
                onSendMedia={handleSendMedia}
                disabled={sending}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-semibold mb-1">Select a chat</h3>
                <p className="text-sm">
                  Choose a contact from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Contact Details Panel */}
        {showContactDetails && selectedContact && (
          <ContactDetailsPanel
            contact={selectedContact}
            onClose={() => setShowContactDetails(false)}
            onEdit={(contact) => {
              // Navigate to edit contact
              navigate(`/whatsapp/contacts?edit=${contact._id}`);
            }}
          />
        )}
      </div>

      {/* Send Template Dialog */}
      <SendTemplateDialog
        open={showSendTemplate}
        onOpenChange={setShowSendTemplate}
        template={selectedTemplate}
        contacts={contacts}
        onSend={handleSendTemplate}
      />
    </div>
  );
}