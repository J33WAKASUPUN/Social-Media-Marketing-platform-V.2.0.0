import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, FileText } from "lucide-react";
import { mockPosts, PostStatus } from "@/lib/mockData";

export default function Posts() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const getPostsByStatus = (status?: PostStatus) => {
    return mockPosts.filter((post) => !status || post.status === status);
  };

  const allPosts = getPostsByStatus();
  const scheduledPosts = getPostsByStatus("scheduled");
  const publishedPosts = getPostsByStatus("published");
  const draftPosts = getPostsByStatus("draft");
  const failedPosts = getPostsByStatus("failed");

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-full bg-muted p-6">
        <FileText className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No posts yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">Create your first post to get started</p>
      <Button className="mt-4" variant="gradient" onClick={() => navigate("/posts/new")}>
        <Plus className="mr-2 h-4 w-4" />
        Create Post
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Posts"
        description="Manage and schedule your social media posts"
        actions={
          <Button variant="gradient" onClick={() => navigate("/posts/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        }
      />

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({allPosts.length})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({scheduledPosts.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedPosts.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftPosts.length})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({failedPosts.length})</TabsTrigger>
        </TabsList>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="newest">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="engagement">Most Engagement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="space-y-4">
          {allPosts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={(id) => console.log("Edit", id)}
                  onDelete={(id) => console.log("Delete", id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {scheduledPosts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scheduledPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={(id) => console.log("Edit", id)}
                  onDelete={(id) => console.log("Delete", id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          {publishedPosts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {publishedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={(id) => console.log("Edit", id)}
                  onDelete={(id) => console.log("Delete", id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          {draftPosts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {draftPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={(id) => console.log("Edit", id)}
                  onDelete={(id) => console.log("Delete", id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          {failedPosts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {failedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={(id) => console.log("Edit", id)}
                  onDelete={(id) => console.log("Delete", id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
