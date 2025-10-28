import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Download } from "lucide-react";
import { mockAnalytics } from "@/lib/mockData";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PlatformBadge } from "@/components/PlatformBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Analytics() {
  const dateRanges = ["7 days", "30 days", "90 days", "All time"];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Analytics"
        description="Track your social media performance"
        actions={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="flex gap-2">
        {dateRanges.map((range, index) => (
          <Button
            key={range}
            variant={index === 1 ? "default" : "outline"}
            size="sm"
          >
            {range}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Posts"
          value={mockAnalytics.totalPosts}
          change="+12 this week"
          changeType="positive"
          icon={FileText}
        />
        <StatCard
          title="Total Engagement"
          value={mockAnalytics.totalEngagement.toLocaleString()}
          subtitle="Likes + Comments + Shares"
          icon={TrendingUp}
        />
        <StatCard
          title="Best Platform"
          value="LinkedIn"
          subtitle="Highest engagement rate"
        />
        <StatCard
          title="Avg Engagement Rate"
          value={`${mockAnalytics.avgEngagementRate}%`}
          change="+0.5%"
          changeType="positive"
        />
      </div>

      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockAnalytics.engagementOverTime}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="likes"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Likes"
              />
              <Line
                type="monotone"
                dataKey="comments"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                name="Comments"
              />
              <Line
                type="monotone"
                dataKey="shares"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                name="Shares"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Posts by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockAnalytics.postsByPlatform}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="platform" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="posts" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Top Posting Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockAnalytics.postingDays}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="posts" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Total Posts</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Engagement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAnalytics.platformPerformance.map((platform) => (
                <TableRow key={platform.platform}>
                  <TableCell>
                    <PlatformBadge platform={platform.platform.toLowerCase()} />
                  </TableCell>
                  <TableCell>{platform.totalPosts}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        platform.successRate >= 95
                          ? "bg-success text-success-foreground"
                          : platform.successRate >= 90
                          ? "bg-warning text-warning-foreground"
                          : "bg-destructive text-destructive-foreground"
                      }
                    >
                      {platform.successRate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{platform.engagement.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
