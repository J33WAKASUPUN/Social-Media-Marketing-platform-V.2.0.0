import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { postApi } from '@/services/postApi';
import { format } from 'date-fns';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [originalPost, setOriginalPost] = useState<any>(null);

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postApi.getById(id!);
      const post = response.data;
      
      // Safety check: Don't edit published posts
      if (post.status === 'published') {
        toast.error('Cannot edit a published post');
        navigate('/posts');
        return;
      }

      setOriginalPost(post);
      setContent(post.content);
      
      // Format existing schedule date for the input (YYYY-MM-DDThh:mm)
      if (post.schedules && post.schedules.length > 0) {
        const date = new Date(post.schedules[0].scheduledFor);
        // Adjust for local input requirement
        const localIso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setScheduledFor(localIso);
      }
      
    } catch (error) {
      toast.error('Failed to load post');
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  };

const handleUpdate = async () => {
  try {
    setSaving(true);
    
    const updates: any = { 
      content,
    };

    // ✅ Update schedule time if changed
    if (scheduledFor && originalPost.schedules.length > 0) {
      const newScheduleTime = new Date(scheduledFor).toISOString();
      const oldScheduleTime = new Date(originalPost.schedules[0].scheduledFor).toISOString();

      if (newScheduleTime !== oldScheduleTime) {
        updates.schedules = [{
          channel: originalPost.schedules[0].channel._id,
          provider: originalPost.schedules[0].channel.provider,
          scheduledFor: newScheduleTime,
        }];
      }
    }

    await postApi.update(id!, updates);
    
    toast.success('Post updated successfully');
    navigate('/posts');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to update post');
  } finally {
    setSaving(false);
  }
};

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/posts')} className="pl-0">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Posts
      </Button>

      <PageHeader title="Edit Scheduled Post" description="Modify content or change schedule time" />

      <Card>
        <CardHeader>
          <CardTitle>Edit Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-2">
            <Label>Post Content</Label>
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] text-base"
            />
          </div>

          <div className="space-y-2">
            <Label>Scheduled Time</Label>
            <div className="flex gap-4 items-center">
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Updating this will reschedule the post for all selected platforms.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate('/posts')}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}