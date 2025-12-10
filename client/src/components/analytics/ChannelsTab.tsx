import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Share2,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { Channel } from '@/types';

interface ChannelsTabProps {
  channels: Channel[];
  postsPerChannel: Record<string, { count: number; published: number; scheduled: number; failed: number }>;
  getChannelStats: (channel: Channel) => { count: number; published: number; scheduled: number; failed: number };
}

export function ChannelsTab({ channels, postsPerChannel, getChannelStats }: ChannelsTabProps) {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Channels"
          value={channels.filter(c => c.connectionStatus === 'active').length}
          subtitle="Connected platforms"
          icon={Share2}
        />
        <StatCard
          title="Total Channel Posts"
          value={Object.values(postsPerChannel).reduce((sum, c) => sum + c.count, 0)}
          subtitle="Across all channels"
          icon={FileText}
        />
        <StatCard
          title="Published Posts"
          value={Object.values(postsPerChannel).reduce((sum, c) => sum + c.published, 0)}
          subtitle="Successfully posted"
          icon={CheckCircle}
        />
        <StatCard
          title="Failed Posts"
          value={Object.values(postsPerChannel).reduce((sum, c) => sum + c.failed, 0)}
          subtitle="Needs attention"
          icon={XCircle}
        />
      </div>

      {/* Channel Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Performance</CardTitle>
          <CardDescription>Post statistics for each connected channel</CardDescription>
        </CardHeader>
        <CardContent>
          {channels.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Posts</TableHead>
                  <TableHead className="text-right">Published</TableHead>
                  <TableHead className="text-right">Scheduled</TableHead>
                  <TableHead className="text-right">Failed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((channel) => {
                  const channelStats = getChannelStats(channel);
                  
                  return (
                    <TableRow key={channel._id || (channel as any).id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={channel.avatar} />
                            <AvatarFallback>
                              {channel.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{channel.displayName}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {channel.provider}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={channel.connectionStatus === 'active' ? 'default' : 'secondary'}
                          className={cn(
                            channel.connectionStatus === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          )}
                        >
                          {channel.connectionStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {channelStats.count}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {channelStats.published}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {channelStats.scheduled}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {channelStats.failed > 0 ? (
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {channelStats.failed}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Share2 className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No channels connected yet</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Channel Distribution Chart */}
      {channels.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Posts by Channel</CardTitle>
                <CardDescription>Performance across all connected channels</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(300, channels.filter(ch => getChannelStats(ch).count > 0).length * 60)}>
              <BarChart 
                data={channels.map(ch => {
                  const stats = getChannelStats(ch);
                  return {
                    displayName: ch.displayName,
                    provider: ch.provider,
                    totalPosts: stats.count,
                    published: stats.published,
                    scheduled: stats.scheduled,
                    failed: stats.failed,
                    successRate: stats.count > 0 ? ((stats.published / stats.count) * 100).toFixed(1) : 0
                  };
                }).filter(ch => ch.totalPosts > 0)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                <XAxis type="number" className="text-xs" />
                <YAxis 
                  dataKey="displayName" 
                  type="category" 
                  width={140}
                  className="text-xs font-medium"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border bg-card p-4 shadow-xl backdrop-blur-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <p className="font-semibold text-sm">{data.displayName}</p>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between gap-8">
                              <span className="text-muted-foreground">Total Posts:</span>
                              <span className="font-medium">{data.totalPosts}</span>
                            </div>
                            <div className="flex justify-between gap-8">
                              <span className="text-green-600 dark:text-green-400">Published:</span>
                              <span className="font-medium text-green-600 dark:text-green-400">{data.published}</span>
                            </div>
                            <div className="flex justify-between gap-8">
                              <span className="text-amber-600 dark:text-amber-400">Scheduled:</span>
                              <span className="font-medium text-amber-600 dark:text-amber-400">{data.scheduled}</span>
                            </div>
                            <div className="flex justify-between gap-8">
                              <span className="text-red-600 dark:text-red-400">Failed:</span>
                              <span className="font-medium text-red-600 dark:text-red-400">{data.failed}</span>
                            </div>
                            <div className="pt-1.5 mt-1.5 border-t border-border flex justify-between gap-8">
                              <span className="text-muted-foreground">Success Rate:</span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400">{data.successRate}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Bar 
                  dataKey="published" 
                  stackId="a" 
                  fill="#22c55e" 
                  name="Published"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="scheduled" 
                  stackId="a" 
                  fill="#f59e0b" 
                  name="Scheduled"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="failed" 
                  stackId="a" 
                  fill="#ef4444" 
                  name="Failed"
                  radius={[0, 4, 4, 0]}
                />
                <Legend 
                  wrapperStyle={{ paddingLeft: '130px', paddingTop: '20px' }}
                  iconType="circle"
                  align="center"
                  verticalAlign="bottom"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}