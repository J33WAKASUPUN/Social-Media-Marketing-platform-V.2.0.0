import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBrand } from '@/contexts/BrandContext';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { whatsappApi } from '@/services/whatsappApi';
import { channelApi } from '@/services/channelApi';
import type { WhatsAppMessage, WhatsAppContact, Channel } from '@/types';
import { toast } from 'sonner';
import {
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOff,
  Video,
  Search,
  AlertCircle,
  Clock,
  User,
  Calendar,
  Download,
  Filter,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

export default function WhatsAppCallLogs() {
  const navigate = useNavigate();
  const { currentBrand } = useBrand();

  const [loading, setLoading] = useState(true);
  const [callLogs, setCallLogs] = useState<WhatsAppMessage[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [whatsappChannel, setWhatsappChannel] = useState<Channel | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'missed' | 'rejected' | 'accepted' | 'no_answer'>('all');
  const [callTypeFilter, setCallTypeFilter] = useState<'all' | 'voice' | 'video'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

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

      // Get call logs (messages with type 'call')
      const messagesRes = await whatsappApi.getMessages(currentBrand._id, {
        type: 'call',
        limit: 100,
      });

      setCallLogs(messagesRes.data);

      // Get contacts for name lookup
      const contactsRes = await whatsappApi.getContacts(currentBrand._id);
      setContacts(contactsRes.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load call logs');
    } finally {
      setLoading(false);
    }
  };

  // Get contact name by phone
  const getContactName = (phone: string) => {
    const contact = contacts.find((c) => c.phone === phone);
    return contact?.name || phone;
  };

  // Filter call logs
  const filteredCallLogs = callLogs.filter((log) => {
    const phone = log.direction === 'inbound' ? log.from : log.to;
    const contactName = getContactName(phone);

    const matchesSearch =
      contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'all' ||
      log.content.call?.callStatus === statusFilter;

    const matchesCallType =
      callTypeFilter === 'all' ||
      (callTypeFilter === 'video' && log.content.call?.videoCall) ||
      (callTypeFilter === 'voice' && !log.content.call?.videoCall);

    const matchesDate = (() => {
      if (dateFilter === 'all') return true;

      const callDate = new Date(log.timestamp);
      const now = new Date();

      if (dateFilter === 'today') {
        return callDate.toDateString() === now.toDateString();
      }

      if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return callDate >= weekAgo;
      }

      if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return callDate >= monthAgo;
      }

      return true;
    })();

    return matchesSearch && matchesStatus && matchesCallType && matchesDate;
  });

  // Stats
  const stats = {
    total: callLogs.length,
    missed: callLogs.filter((l) => l.content.call?.callStatus === 'missed').length,
    accepted: callLogs.filter((l) => l.content.call?.callStatus === 'accepted').length,
    rejected: callLogs.filter((l) => l.content.call?.callStatus === 'rejected').length,
    video: callLogs.filter((l) => l.content.call?.videoCall).length,
  };

  // Get call icon based on status and direction
  const getCallIcon = (log: WhatsAppMessage) => {
    const status = log.content.call?.callStatus;
    const isInbound = log.direction === 'inbound';

    if (status === 'missed') {
      return <PhoneMissed className="h-4 w-4 text-red-600 dark:text-red-400" />;
    }
    if (status === 'rejected') {
      return <PhoneOff className="h-4 w-4 text-red-600 dark:text-red-400" />;
    }
    if (log.content.call?.videoCall) {
      return <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    }
    return isInbound ? (
      <PhoneIncoming className="h-4 w-4 text-green-600 dark:text-green-400" />
    ) : (
      <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
    );
  };

  // Get status badge
  const getStatusBadge = (status?: string) => {
    const config = {
      accepted: { label: 'Answered', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      missed: { label: 'Missed', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      no_answer: { label: 'No Answer', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
    };

    const statusConfig = status ? config[status as keyof typeof config] : null;

    if (!statusConfig) return null;

    return (
      <Badge variant="outline" className={cn('text-xs', statusConfig.color)}>
        {statusConfig.label}
      </Badge>
    );
  };

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins === 0) return `${secs}s`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Export to CSV
  const handleExportCSV = () => {
    const csv = [
      ['Date', 'Time', 'Contact', 'Phone', 'Type', 'Direction', 'Status', 'Duration'],
      ...filteredCallLogs.map((log) => {
        const phone = log.direction === 'inbound' ? log.from : log.to;
        return [
          format(new Date(log.timestamp), 'yyyy-MM-dd'),
          format(new Date(log.timestamp), 'HH:mm:ss'),
          getContactName(phone),
          phone,
          log.content.call?.videoCall ? 'Video' : 'Voice',
          log.direction === 'inbound' ? 'Incoming' : 'Outgoing',
          log.content.call?.callStatus || 'Unknown',
          formatDuration(log.content.call?.duration),
        ];
      }),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-call-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Call logs exported');
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

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
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
            <p>Connect your WhatsApp Business account to view call logs.</p>
            <Button onClick={() => navigate('/channels')}>
              Connect WhatsApp
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Call Logs"
        description="View your WhatsApp call history and analytics"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/whatsapp/inbox')}
            >
              Back to Inbox
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Phone className="h-4 w-4" />
            Total Calls
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mb-1">
            <PhoneIncoming className="h-4 w-4" />
            Answered
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.accepted}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mb-1">
            <PhoneMissed className="h-4 w-4" />
            Missed
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.missed}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mb-1">
            <PhoneOff className="h-4 w-4" />
            Rejected
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.rejected}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-1">
            <Video className="h-4 w-4" />
            Video Calls
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.video}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
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
            <SelectItem value="accepted">Answered</SelectItem>
            <SelectItem value="missed">Missed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="no_answer">No Answer</SelectItem>
          </SelectContent>
        </Select>

        <Select value={callTypeFilter} onValueChange={(value: any) => setCallTypeFilter(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="voice">Voice</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>

        {(searchQuery || statusFilter !== 'all' || callTypeFilter !== 'all' || dateFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCallTypeFilter('all');
              setDateFilter('all');
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Call Logs List */}
      {filteredCallLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Phone className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No call logs found</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || statusFilter !== 'all' || callTypeFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Call history will appear here'}
          </p>
        </div>
      ) : (
        <Card>
          <ScrollArea className="h-[600px]">
            <div className="divide-y">
              {filteredCallLogs.map((log) => {
                const phone = log.direction === 'inbound' ? log.from : log.to;
                const contactName = getContactName(phone);
                const callDate = new Date(log.timestamp);

                return (
                  <div
                    key={log._id}
                    className="p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="mt-1">{getCallIcon(log)}</div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold truncate">{contactName}</p>
                          {log.content.call?.videoCall && (
                            <Badge variant="outline" className="text-xs">
                              Video
                            </Badge>
                          )}
                          {getStatusBadge(log.content.call?.callStatus)}
                        </div>

                        <p className="text-sm text-muted-foreground truncate">
                          {phone}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(callDate, 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(callDate, 'HH:mm:ss')}
                          </div>
                          {log.content.call?.duration !== undefined && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {formatDuration(log.content.call.duration)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Direction & Time Ago */}
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs mb-2">
                          {log.direction === 'inbound' ? 'Incoming' : 'Outgoing'}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(callDate, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}