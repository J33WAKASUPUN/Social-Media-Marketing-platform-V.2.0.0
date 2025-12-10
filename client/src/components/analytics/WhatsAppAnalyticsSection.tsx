import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageCircle,
  Send,
  Download,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Phone,
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { channelApi } from '@/services/channelApi';
import { whatsappApi } from '@/services/whatsappApi';
import { toast } from 'sonner';

interface WhatsAppAnalyticsSectionProps {
  brandId: string;
}

// WhatsApp Brand Colors
const WHATSAPP_COLORS = {
  primary: '#25D366',
  sent: '#667eea',
  received: '#764ba2',
  delivered: '#10B981',
  failed: '#EF4444',
};

export function WhatsAppAnalyticsSection({ brandId }: WhatsAppAnalyticsSectionProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [hasWhatsAppChannel, setHasWhatsAppChannel] = useState(false); // ✅ NEW: Track if channel exists

  useEffect(() => {
    loadWhatsAppAnalytics();
  }, [brandId]);

  const loadWhatsAppAnalytics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Check if WhatsApp channel exists
      const channelsRes = await channelApi.getAll(brandId);
      const whatsappChannel = channelsRes.data.find((ch: any) => ch.provider === 'whatsapp');

      // ✅ FIX: Track channel existence separately
      setHasWhatsAppChannel(!!whatsappChannel);

      if (!whatsappChannel) {
        setStats(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Get WhatsApp data
      const [messagesRes, contactsRes, templatesRes] = await Promise.all([
        whatsappApi.getMessages({ brandId, limit: 100 }),
        whatsappApi.getContacts(brandId),
        whatsappApi.getTemplates(brandId),
      ]);

      const messages = messagesRes.data;
      const contacts = contactsRes.data;
      const templates = templatesRes.data;

      // Calculate comprehensive stats
      const totalMessages = messages.length;
      const sentMessages = messages.filter((m: any) => m.direction === 'outbound').length;
      const receivedMessages = messages.filter((m: any) => m.direction === 'inbound').length;
      const deliveredMessages = messages.filter(
        (m: any) => m.status === 'delivered' || m.status === 'read'
      ).length;
      const failedMessages = messages.filter((m: any) => m.status === 'failed').length;
      const readMessages = messages.filter((m: any) => m.status === 'read').length;
      
      const deliveryRate = totalMessages > 0 
        ? ((deliveredMessages / totalMessages) * 100).toFixed(1) 
        : '0';
      
      const readRate = sentMessages > 0
        ? ((readMessages / sentMessages) * 100).toFixed(1)
        : '0';

      const totalContacts = contacts.length;
      const optedInContacts = contacts.filter((c: any) => c.optedIn).length;
      const optInRate = totalContacts > 0 
        ? ((optedInContacts / totalContacts) * 100).toFixed(1) 
        : '0';

      const approvedTemplates = templates.filter((t: any) => t.status === 'APPROVED').length;
      const pendingTemplates = templates.filter((t: any) => t.status === 'PENDING').length;
      
      // Response rate calculation
      const responseRate = sentMessages > 0 
        ? ((receivedMessages / sentMessages) * 100).toFixed(1)
        : '0';

      // Message type distribution
      const messagesByType = messages.reduce((acc: any, msg: any) => {
        acc[msg.type] = (acc[msg.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate trends
      const now = new Date();
      const last7Days = messages.filter((m: any) => {
        const msgDate = new Date(m.timestamp);
        const daysAgo = Math.floor((now.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysAgo <= 7;
      });
      const prev7Days = messages.filter((m: any) => {
        const msgDate = new Date(m.timestamp);
        const daysAgo = Math.floor((now.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysAgo > 7 && daysAgo <= 14;
      });

      const messageTrend = last7Days.length - prev7Days.length;
      const messageTrendPercentage = prev7Days.length > 0
        ? ((messageTrend / prev7Days.length) * 100).toFixed(1)
        : '0';

      setStats({
        totalMessages,
        sentMessages,
        receivedMessages,
        deliveredMessages,
        failedMessages,
        readMessages,
        deliveryRate,
        readRate,
        totalContacts,
        optedInContacts,
        optInRate,
        approvedTemplates,
        pendingTemplates,
        totalTemplates: templates.length,
        responseRate,
        messagesByType,
        messageTrend,
        messageTrendPercentage,
        last7DaysCount: last7Days.length,
      });
    } catch (error: any) {
      console.error('Failed to load WhatsApp analytics:', error);
      // ✅ FIX: Don't set stats to null on error if channel exists
      if (!hasWhatsAppChannel) {
        setStats(null);
      } else {
        toast.error('Failed to load WhatsApp analytics data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Only show "not connected" state if channel doesn't exist
  if (!hasWhatsAppChannel) {
    return (
      <Card className="border-dashed bg-muted/5 border-2">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">WhatsApp Not Connected</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Connect your WhatsApp Business account to view analytics, send messages, and manage contacts.
          </p>
          <Button onClick={() => navigate('/channels')} className="bg-[#25D366] hover:bg-[#25D366]/90 text-white">
            <MessageCircle className="h-4 w-4 mr-2" />
            Connect WhatsApp
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show empty state with data (channel exists but no activity yet)
  if (!stats || stats.totalMessages === 0) {
    return (
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-green-600" />
              WhatsApp Analytics
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor your WhatsApp Business performance
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadWhatsAppAnalytics(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Empty State - Channel Connected but No Data */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">WhatsApp Connected Successfully!</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Your WhatsApp Business account is connected. Start sending messages to see analytics here.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/whatsapp/inbox')} className="bg-[#25D366] hover:bg-[#25D366]/90 text-white">
                <Send className="h-4 w-4 mr-2" />
                Go to Inbox
              </Button>
              <Button variant="outline" onClick={() => navigate('/whatsapp/templates')}>
                <FileText className="h-4 w-4 mr-2" />
                Create Template
              </Button>
              <Button variant="outline" onClick={() => navigate('/whatsapp/contacts')}>
                <Users className="h-4 w-4 mr-2" />
                Add Contacts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const messageTypeData = Object.entries(stats.messagesByType).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    percentage: ((count as number / stats.totalMessages) * 100).toFixed(1),
  }));

  const MESSAGE_TYPE_COLORS: Record<string, string> = {
    text: '#667eea',
    image: '#10B981',
    video: '#3B82F6',
    audio: '#F59E0B',
    document: '#8B5CF6',
    template: '#EC4899',
    call: '#EF4444',
  };

  const statusDistribution = [
    { name: 'Delivered', value: stats.deliveredMessages, color: WHATSAPP_COLORS.delivered },
    { name: 'Sent', value: stats.sentMessages - stats.deliveredMessages, color: WHATSAPP_COLORS.sent },
    { name: 'Failed', value: stats.failedMessages, color: WHATSAPP_COLORS.failed },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-green-600" />
            WhatsApp Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your WhatsApp Business performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadWhatsAppAnalytics(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Messages */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-green-500/10 p-4">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-3xl font-bold">{stats.totalMessages}</p>
                {stats.messageTrend !== 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {stats.messageTrend > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs ${stats.messageTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(parseFloat(stats.messageTrendPercentage))}% vs last week
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sent Messages */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-500/10 p-4">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sent Messages</p>
                <p className="text-3xl font-bold">{stats.sentMessages}</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    {stats.deliveryRate}% delivered
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-purple-500/10 p-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                <p className="text-3xl font-bold">{stats.totalContacts}</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    {stats.optedInContacts} opted in ({stats.optInRate}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-orange-500/10 p-4">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Templates</p>
                <p className="text-3xl font-bold">{stats.totalTemplates}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {stats.approvedTemplates} approved
                  </Badge>
                  {stats.pendingTemplates > 0 && (
                    <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      {stats.pendingTemplates} pending
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Message Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Message Types
            </CardTitle>
            <CardDescription>Distribution of message types sent</CardDescription>
          </CardHeader>
          <CardContent>
            {messageTypeData.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={messageTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {messageTypeData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={MESSAGE_TYPE_COLORS[entry.name.toLowerCase()] || '#666'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-lg">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {data.value} messages ({data.percentage}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="space-y-2 min-w-[150px]">
                  {messageTypeData.map((type) => (
                    <div key={type.name} className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: MESSAGE_TYPE_COLORS[type.name.toLowerCase()] || '#666' }}
                      />
                      <span className="text-sm flex-1">{type.name}</span>
                      <span className="text-sm font-medium">{type.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                <p>No message type data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Message Status
            </CardTitle>
            <CardDescription>Delivery status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.value} messages
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                <p>No status data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Delivery Rate</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-3xl font-bold">{stats.deliveryRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.deliveredMessages} of {stats.totalMessages} delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Read Rate</span>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">{stats.readRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.readMessages} of {stats.sentMessages} read
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Response Rate</span>
              <MessageCircle className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-3xl font-bold">{stats.responseRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.receivedMessages} replies to {stats.sentMessages} sent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Footer */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" size="sm" onClick={() => navigate('/whatsapp/templates')}>
          <FileText className="h-4 w-4 mr-2" />
          Manage Templates
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/whatsapp/contacts')}>
          <Users className="h-4 w-4 mr-2" />
          View Contacts
        </Button>
        <Button size="sm" onClick={() => navigate('/whatsapp/inbox')} className="bg-[#25D366] hover:bg-[#25D366]/90 text-white">
          <MessageCircle className="h-4 w-4 mr-2" />
          Go to Inbox
        </Button>
      </div>
    </div>
  );
}