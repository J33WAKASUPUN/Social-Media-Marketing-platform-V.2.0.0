import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
// UPDATED: Added AvatarImage to imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sparkles,
  Send,
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  Archive,
  MoreVertical,
  Copy,
  Check,
  Loader2,
  Bot,
  User as UserIcon,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { aiApi, type Conversation } from '@/services/aiApi';
import { useBrand } from '@/contexts/BrandContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// --- Sub-Component: Conversation Item ---
interface ConversationItemProps {
  conv: Conversation;
  isSelected: boolean;
  isSidebarHovered: boolean;
  onSelect: (conv: Conversation) => void;
}

const ConversationItem = ({
  conv,
  isSelected,
  isSidebarHovered,
  onSelect,
}: ConversationItemProps) => {
  return (
    <div
      onClick={() => onSelect(conv)}
      className={cn(
        'group flex items-center cursor-pointer transition-all duration-200 relative overflow-hidden rounded-xl',
        isSidebarHovered ? "p-3" : "justify-center p-3 h-14",
        isSelected
          ? 'bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800'
          : 'hover:bg-accent border border-transparent'
      )}
    >
      <div className="shrink-0 p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
        <Bot className="h-4 w-4 text-violet-600 dark:text-violet-400" />
      </div>
      
      {/* Text Animation Trick */}
      <div className={cn(
        "grid transition-all duration-300 ease-in-out", 
        isSidebarHovered ? "grid-cols-[1fr] ml-3" : "grid-cols-[0fr] ml-0"
      )}>
        <div className="overflow-hidden min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium truncate">
              {conv.title}
            </span>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
              {format(new Date(conv.lastActivity), 'MMM d')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {conv.lastMessage?.content}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

export default function AIChat() {
  const { currentBrand } = useBrand();
  const { user } = useAuth();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Dialog States
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  
  // Delete Confirmation State
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status Filter State & Counts
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived'>('active');
  const [counts, setCounts] = useState({ active: 0, archived: 0 });

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  // Sidebar Hover State
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Refs for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Load Conversations & Counts when Brand/Filter changes
  useEffect(() => {
    loadConversations();
    fetchCounts(); // Fetch counts for both tabs
    setSelectedConversation(null); 
  }, [currentBrand, statusFilter]);

  // 2. Auto-Scroll Effect: Triggered when messages change or 'sending' state changes
  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages, sending]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCounts = async () => {
    if (!currentBrand) return;
    try {
        // Parallel fetching for counts to keep UI snappy
        const [activeRes, archivedRes] = await Promise.all([
            aiApi.getConversations({ brandId: currentBrand._id, status: 'active', limit: 1 }),
            aiApi.getConversations({ brandId: currentBrand._id, status: 'archived', limit: 1 })
        ]);
        
        // Note: Replace `response.data.length` with `response.total` if your API supports pagination metadata
        setCounts({
            active: activeRes.data.length || 0, 
            archived: archivedRes.data.length || 0
        });
    } catch (error) {
        console.error("Failed to fetch counts", error);
    }
  };

  const loadConversations = async () => {
    if (!currentBrand) return;

    setLoading(true);
    try {
      const response = await aiApi.getConversations({
        brandId: currentBrand._id,
        status: statusFilter, 
        limit: 50,
      });
      setConversations(Array.isArray(response.data) ? response.data : []);
      
      // Update the count for the CURRENT filter immediately based on result
      setCounts(prev => ({
          ...prev,
          [statusFilter]: response.data.length
      }));

    } catch (error: any) {
      toast.error('Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;
    const userMessage = message.trim();
    setMessage('');
    setSending(true);

    try {
      const response = await aiApi.chat({
        message: userMessage,
        conversationId: selectedConversation?._id,
        brandId: currentBrand?._id,
      });

      if (selectedConversation) {
        const updatedConv = await aiApi.getConversation(response.data.conversationId);
        setSelectedConversation(updatedConv.data);
        
        if (statusFilter === 'active') {
             setConversations(prev =>
               prev.map(c => (c._id === response.data.conversationId ? updatedConv.data : c))
             );
        } else {
             loadConversations();
        }
       
      } else {
        const newConv = await aiApi.getConversation(response.data.conversationId);
        setSelectedConversation(newConv.data);
        
        // Update counts and list
        if (statusFilter === 'active') {
            setConversations(prev => [newConv.data, ...prev]);
            setCounts(prev => ({ ...prev, active: prev.active + 1 }));
        } else {
            setStatusFilter('active'); 
            // The useEffect will handle reloading active list
        }
      }
      textareaRef.current?.focus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleNewChat = () => {
    setSelectedConversation(null);
    setMessage('');
    setShowNewChatDialog(false);
    setStatusFilter('active');
    textareaRef.current?.focus();
  };

  const initiateDelete = (id: string) => {
    setConversationToDelete(id);
  };

  const executeDeleteConversation = async () => {
    if (!conversationToDelete) return;
    
    setIsDeleting(true);
    try {
      await aiApi.deleteConversation(conversationToDelete);
      setConversations(prev => prev.filter(c => c._id !== conversationToDelete));
      
      // Update Counts
      setCounts(prev => ({
          ...prev,
          [statusFilter]: Math.max(0, prev[statusFilter] - 1)
      }));

      if (selectedConversation?._id === conversationToDelete) {
        setSelectedConversation(null);
      }
      toast.success('Conversation deleted');
      setConversationToDelete(null); 
    } catch (error: any) {
      toast.error('Failed to delete conversation');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchiveConversation = async (id: string) => {
    try {
      await aiApi.updateConversation(id, { status: 'archived' });
      setConversations(prev => prev.filter(c => c._id !== id));
      if (selectedConversation?._id === id) setSelectedConversation(null);
      
      // Update Counts locally
      setCounts(prev => ({
          active: Math.max(0, prev.active - 1),
          archived: prev.archived + 1
      }));
      
      toast.success('Conversation archived');
    } catch (error: any) {
      toast.error('Failed to archive conversation');
    }
  };

  const handleUnarchiveConversation = async (id: string) => {
     try {
       await aiApi.updateConversation(id, { status: 'active' });
       setConversations(prev => prev.filter(c => c._id !== id));
       if (selectedConversation?._id === id) setSelectedConversation(null);
       
       // Update Counts locally
       setCounts(prev => ({
        active: prev.active + 1,
        archived: Math.max(0, prev.archived - 1)
       }));

       toast.success('Conversation unarchived');
     } catch (error: any) {
       toast.error('Failed to unarchive conversation');
     }
  };

  const handleRenameConversation = async () => {
    if (!selectedConversation || !newTitle.trim()) return;
    try {
      await aiApi.updateConversation(selectedConversation._id, { title: newTitle.trim() });
      const updatedConv = { ...selectedConversation, title: newTitle.trim() };
      setSelectedConversation(updatedConv);
      setConversations(prev =>
        prev.map(c => (c._id === selectedConversation._id ? updatedConv : c))
      );
      setEditingTitle(false);
      toast.success('Conversation renamed');
    } catch (error: any) {
      toast.error('Failed to rename conversation');
    }
  };

  const initiateRename = (conv: Conversation) => {
    setNewTitle(conv.title);
    setEditingTitle(true);
  };

  const handleCopyMessage = async (content: string, messageId: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentBrand) return null;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background p-6">
      <PageHeader
        title="AI Assistant"
        description="Chat with AI to create content and get marketing advice"
      />

      <div className="flex-1 flex gap-6 mt-6 overflow-hidden">
        
        {/* SIDEBAR */}
        <Card 
          className={cn(
            "flex flex-col overflow-hidden transition-all duration-300 ease-in-out z-10",
            isSidebarHovered ? "w-80" : "w-20"
          )}
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
        >
          {/* Sidebar Header */}
          <CardHeader className="border-b px-0 py-4 pb-2">
            <div className={cn("flex items-center", isSidebarHovered ? "justify-between px-4" : "justify-center flex-col gap-2")}>
              
              <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                isSidebarHovered ? "grid-cols-[1fr]" : "grid-cols-[0fr]"
              )}>
                <div className="overflow-hidden min-w-0 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-violet-600 shrink-0" />
                    <CardTitle className="text-lg whitespace-nowrap">
                        Chats
                    </CardTitle>
                </div>
              </div>

              {/* New Chat Button */}
              <Button
                variant={isSidebarHovered ? "ghost" : "default"}
                size="sm"
                onClick={handleNewChat}
                className={cn(
                    "transition-all duration-200 shrink-0", 
                    !isSidebarHovered && "h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-200 shadow-sm p-0"
                )}
                title="New Chat"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          {/* TOGGLE TABS (Active / Archived) WITH COUNTS */}
          <div className={cn(
              "px-4 pb-2 pt-2 transition-all duration-300",
              isSidebarHovered ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden pointer-events-none"
          )}>
             <div className="flex p-1 bg-muted rounded-lg">
                <button 
                    onClick={() => setStatusFilter('active')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all",
                        statusFilter === 'active' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Active
                    <span className={cn("ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400")}>
                        {counts.active}
                    </span>
                </button>
                <button 
                    onClick={() => setStatusFilter('archived')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all",
                        statusFilter === 'archived' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Archived
                    <span className={cn("ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400")}>
                        {counts.archived}
                    </span>
                </button>
             </div>
          </div>

          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                 {isSidebarHovered ? (
                    <>
                        <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-3">
                        {statusFilter === 'active' ? (
                             <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                        ) : (
                             <Archive className="h-6 w-6 text-muted-foreground" />
                        )}
                        </div>
                        <p className="text-sm font-medium">No {statusFilter} chats</p>
                    </>
                 ) : (
                    statusFilter === 'active' ? (
                        <Sparkles className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <Archive className="h-5 w-5 text-muted-foreground" />
                    )
                 )}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map((conv) => (
                  <ConversationItem
                    key={conv._id}
                    conv={conv}
                    isSelected={selectedConversation?._id === conv._id}
                    isSidebarHovered={isSidebarHovered}
                    onSelect={setSelectedConversation}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Right Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden min-w-0">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                      {statusFilter === 'archived' ? (
                           <Archive className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      ) : (
                           <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{selectedConversation.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                          {selectedConversation.messages.length} messages
                          {statusFilter === 'archived' && " • Archived"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={loadConversations} disabled={loading} title="Refresh">
                        <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => initiateRename(selectedConversation)}>
                          <Edit3 className="h-4 w-4 mr-2" /> Rename
                        </DropdownMenuItem>
                        
                        {/* Dynamic Action: Archive vs Unarchive */}
                        {statusFilter === 'active' ? (
                            <DropdownMenuItem onClick={() => handleArchiveConversation(selectedConversation._id)}>
                                <Archive className="h-4 w-4 mr-2" /> Archive
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={() => handleUnarchiveConversation(selectedConversation._id)}>
                                <Sparkles className="h-4 w-4 mr-2" /> Unarchive
                            </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => initiateDelete(selectedConversation._id)}
                          className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {selectedConversation.messages.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    const messageId = `${selectedConversation._id}-${index}`;
                    return (
                      <div key={index} className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
                        {!isUser && (
                          <Avatar className="h-8 w-8 mt-1 shrink-0">
                            <AvatarFallback className="bg-violet-100 dark:bg-violet-900/30">
                              <Bot className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn('max-w-[70%] rounded-2xl px-4 py-3 relative group', isUser ? 'bg-violet-600 text-white' : 'bg-muted text-foreground border')}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          <p className={cn('text-xs mt-2', isUser ? 'text-violet-100' : 'text-muted-foreground')}>{format(new Date(msg.timestamp), 'h:mm a')}</p>
                          <Button variant="ghost" size="sm" className={cn('absolute -top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity', isUser ? 'bg-violet-700 hover:bg-violet-800 text-white' : 'bg-background')} onClick={() => handleCopyMessage(msg.content, messageId)}>
                            {copiedMessageId === messageId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                        {isUser && (
                          <Avatar className="h-8 w-8 mt-1 shrink-0">
                            {/* UPDATED: Added AvatarImage for user */}
                            <AvatarImage src={user?.avatarUrl || user?.avatar} />
                            <AvatarFallback className="bg-primary text-primary-foreground">{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                  {sending && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="h-8 w-8 mt-1"><AvatarFallback className="bg-violet-100 dark:bg-violet-900/30"><Bot className="h-4 w-4 text-violet-600 dark:text-violet-400" /></AvatarFallback></Avatar>
                      <div className="bg-muted rounded-2xl px-4 py-3 border"><div className="flex gap-1"><div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" /><div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} /><div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} /></div></div>
                    </div>
                  )}
                  {/* Invisible div to scroll to */}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea ref={textareaRef} placeholder="Ask me anything..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyPress} rows={3} className="resize-none" disabled={sending} />
                  <Button onClick={handleSendMessage} disabled={!message.trim() || sending} className="bg-violet-600 hover:bg-violet-700 h-auto px-6">{sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3">AI Content Assistant</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Get help creating engaging social media content, generating post ideas, and
                optimizing your marketing strategy.
              </p>

              <div className="grid grid-cols-2 gap-4 max-w-2xl mb-8">
                <Card className="p-4 border-violet-200 dark:border-violet-800 hover:border-violet-400 transition-colors cursor-pointer" onClick={() => {setMessage("Generate 5 post ideas for a tech startup"); textareaRef.current?.focus();}}>
                  <p className="text-sm font-medium mb-2">💡 Content Ideas</p>
                  <p className="text-xs text-muted-foreground">"Generate 5 post ideas for a tech startup"</p>
                </Card>
                <Card className="p-4 border-violet-200 dark:border-violet-800 hover:border-violet-400 transition-colors cursor-pointer" onClick={() => {setMessage("Write a LinkedIn post about productivity"); textareaRef.current?.focus();}}>
                  <p className="text-sm font-medium mb-2">✍️ Write Posts</p>
                  <p className="text-xs text-muted-foreground">"Write a LinkedIn post about productivity"</p>
                </Card>
                <Card className="p-4 border-violet-200 dark:border-violet-800 hover:border-violet-400 transition-colors cursor-pointer" onClick={() => {setMessage("Best times to post on Instagram?"); textareaRef.current?.focus();}}>
                  <p className="text-sm font-medium mb-2">📊 Strategy Help</p>
                  <p className="text-xs text-muted-foreground">"Best times to post on Instagram?"</p>
                </Card>
                <Card className="p-4 border-violet-200 dark:border-violet-800 hover:border-violet-400 transition-colors cursor-pointer" onClick={() => {setMessage("Suggest hashtags for a fitness brand"); textareaRef.current?.focus();}}>
                  <p className="text-sm font-medium mb-2">🎯 Hashtag Research</p>
                  <p className="text-xs text-muted-foreground">"Suggest hashtags for a fitness brand"</p>
                </Card>
              </div>

              <div className="w-full max-w-2xl">
                <div className="flex gap-2">
                  <Textarea ref={textareaRef} placeholder="Start chatting with AI..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyPress} rows={3} className="resize-none" disabled={sending} />
                  <Button onClick={handleSendMessage} disabled={!message.trim() || sending} className="bg-violet-600 hover:bg-violet-700 h-auto px-6">{sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}</Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* RENAME DIALOG */}
      <Dialog open={editingTitle} onOpenChange={setEditingTitle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
            <DialogDescription>
              Give this conversation a memorable name
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Conversation title..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTitle(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameConversation} disabled={!newTitle.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!conversationToDelete} onOpenChange={(open) => !open && setConversationToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <DialogTitle>Delete Conversation?</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
                variant="outline" 
                onClick={() => setConversationToDelete(null)}
                disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
                variant="destructive" 
                onClick={executeDeleteConversation}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...
                  </>
              ) : (
                  'Delete Conversation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}