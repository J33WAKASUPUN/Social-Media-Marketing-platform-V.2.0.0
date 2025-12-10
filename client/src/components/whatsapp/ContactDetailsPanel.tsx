import { X, Mail, Phone, Tag, Users, Calendar, Edit, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { WhatsAppContact } from '@/types';
import { format } from 'date-fns';

interface ContactDetailsPanelProps {
  contact: WhatsAppContact | null;
  onClose: () => void;
  onEdit?: (contact: WhatsAppContact) => void;
  onDelete?: (contactId: string) => void;
}

export function ContactDetailsPanel({
  contact,
  onClose,
  onEdit,
  onDelete,
}: ContactDetailsPanelProps) {
  if (!contact) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-80 border-l bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Contact Info</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Profile */}
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 mb-3">
              <AvatarFallback className="bg-green-600 text-white text-xl">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <h4 className="text-lg font-semibold">{contact.name}</h4>
            <p className="text-sm text-muted-foreground">{contact.phone}</p>
          </div>

          <Separator />

          {/* Email */}
          {contact.email && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">Email</span>
                </div>
                <p className="text-sm pl-6">{contact.email}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Phone */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span className="font-medium">Phone</span>
            </div>
            <p className="text-sm pl-6">{contact.phone}</p>
          </div>

          <Separator />

          {/* Opt-in Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">Status</span>
            </div>
            <div className="pl-6">
              <Badge variant={contact.optedIn ? 'default' : 'secondary'}>
                {contact.optedIn ? 'Opted In' : 'Not Opted In'}
              </Badge>
              {contact.optedInAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Since {format(new Date(contact.optedInAt), 'MMM dd, yyyy')}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Tags */}
          {contact.tags.length > 0 && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span className="font-medium">Tags</span>
                </div>
                <div className="flex flex-wrap gap-1 pl-6">
                  {contact.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Groups */}
          {contact.groups.length > 0 && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Groups</span>
                </div>
                <div className="flex flex-wrap gap-1 pl-6">
                  {contact.groups.map((group) => (
                    <Badge key={group} variant="secondary">
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Last Message */}
          {contact.lastMessageSentAt && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Last Message</span>
                </div>
                <p className="text-sm pl-6">
                  {format(new Date(contact.lastMessageSentAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* Notes */}
          {contact.notes && (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="text-sm pl-0 whitespace-pre-wrap">{contact.notes}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Custom Fields */}
          {contact.customFields && Object.keys(contact.customFields).length > 0 && (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Custom Fields</p>
                <div className="space-y-1 pl-0">
                  {Object.entries(contact.customFields).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="font-medium">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Created Date */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Member Since</p>
            <p className="text-sm">{format(new Date(contact.createdAt), 'MMM dd, yyyy')}</p>
          </div>
        </div>
      </ScrollArea>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="p-4 border-t space-y-2">
          {onEdit && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onEdit(contact)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Contact
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(contact._id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Contact
            </Button>
          )}
        </div>
      )}
    </div>
  );
}