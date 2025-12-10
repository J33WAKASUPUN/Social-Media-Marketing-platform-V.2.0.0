import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { WhatsAppContact, WhatsAppMessage } from '@/types';
import { ContactCard } from './ContactCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

interface ChatListProps {
  contacts: WhatsAppContact[];
  selectedContact: WhatsAppContact | null;
  onSelectContact: (contact: WhatsAppContact) => void;
  loading: boolean;
  lastMessages?: Record<string, WhatsAppMessage>;
  onFilterChange?: (filters: { tags: string[]; groups: string[] }) => void;
  availableTags?: string[];
  availableGroups?: string[];
}

export function ChatList({
  contacts,
  selectedContact,
  onSelectContact,
  loading,
  lastMessages = {},
  onFilterChange,
  availableTags = [],
  availableGroups = [],
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Filter contacts by search query
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery);
    
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => contact.tags.includes(tag));
    
    const matchesGroups =
      selectedGroups.length === 0 ||
      selectedGroups.some((group) => contact.groups.includes(group));

    return matchesSearch && matchesTags && matchesGroups;
  });

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    onFilterChange?.({ tags: newTags, groups: selectedGroups });
  };

  const handleGroupToggle = (group: string) => {
    const newGroups = selectedGroups.includes(group)
      ? selectedGroups.filter((g) => g !== group)
      : [...selectedGroups, group];
    
    setSelectedGroups(newGroups);
    onFilterChange?.({ tags: selectedTags, groups: newGroups });
  };

  return (
    <div className="w-80 border-r flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chats</h2>
          <Badge variant="secondary">{contacts.length}</Badge>
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

        {/* Filters */}
        {(availableTags.length > 0 || availableGroups.length > 0) && (
          <div className="flex gap-2">
            {availableTags.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Filter className="h-4 w-4 mr-2" />
                    Tags
                    {selectedTags.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedTags.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {availableTags.map((tag) => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {availableGroups.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Filter className="h-4 w-4 mr-2" />
                    Groups
                    {selectedGroups.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedGroups.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {availableGroups.map((group) => (
                    <DropdownMenuCheckboxItem
                      key={group}
                      checked={selectedGroups.includes(group)}
                      onCheckedChange={() => handleGroupToggle(group)}
                    >
                      {group}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {/* Contact List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-2 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-sm">No contacts found</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact._id}
                contact={contact}
                selected={selectedContact?._id === contact._id}
                onClick={() => onSelectContact(contact)}
                lastMessage={lastMessages[contact._id]}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}