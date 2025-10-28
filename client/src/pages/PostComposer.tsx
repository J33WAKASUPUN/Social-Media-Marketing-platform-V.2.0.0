import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockChannels } from "@/lib/mockData";
import { Upload, X, Save, Send } from "lucide-react";
import { PlatformBadge } from "@/components/PlatformBadge";
import { toast } from "sonner";

export default function PostComposer() {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [publishType, setPublishType] = useState<"now" | "schedule">("now");
  const connectedChannels = mockChannels.filter((c) => c.connected);

  const maxChars = selectedPlatforms.includes("twitter") ? 280 : 3000;

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId]
    );
  };

  const handleSaveDraft = () => {
    toast.success("Post saved as draft");
    navigate("/posts");
  };

  const handlePublish = () => {
    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }
    toast.success(publishType === "now" ? "Post published successfully!" : "Post scheduled successfully!");
    navigate("/posts");
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Create Post"
        description="Compose and schedule your social media post"
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Compose</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  placeholder="What do you want to share?"
                  className="min-h-[200px] resize-none"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={maxChars}
                />
                <p className="mt-2 text-right text-xs text-muted-foreground">
                  {content.length} / {maxChars} characters
                </p>
              </div>

              <div className="rounded-lg border-2 border-dashed p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Drop images or click to upload
                </p>
                <p className="text-xs text-muted-foreground">Max 4 images</p>
              </div>

              <div>
                <h3 className="mb-3 font-semibold">Select Platforms</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {connectedChannels.map((channel) => (
                    <div
                      key={channel.id}
                      className="flex items-center space-x-3 rounded-lg border p-3"
                    >
                      <Checkbox
                        id={channel.id}
                        checked={selectedPlatforms.includes(channel.platform)}
                        onCheckedChange={() => handlePlatformToggle(channel.platform)}
                      />
                      <Label
                        htmlFor={channel.id}
                        className="flex flex-1 cursor-pointer items-center gap-2"
                      >
                        <PlatformBadge platform={channel.platform} size="sm" />
                        <span className="text-xs text-muted-foreground">{channel.username}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPlatforms.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  Select platforms to see preview
                </p>
              ) : (
                <Tabs defaultValue={selectedPlatforms[0]} className="w-full">
                  <TabsList className="w-full">
                    {selectedPlatforms.map((platform) => (
                      <TabsTrigger key={platform} value={platform} className="flex-1">
                        {platform}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {selectedPlatforms.map((platform) => (
                    <TabsContent key={platform} value={platform}>
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary" />
                          <div>
                            <p className="text-sm font-semibold">Your Name</p>
                            <p className="text-xs text-muted-foreground">Just now</p>
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap text-sm">
                          {content || "Your content will appear here..."}
                        </p>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={publishType} onValueChange={(v) => setPublishType(v as typeof publishType)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="now" id="now" />
                  <Label htmlFor="now" className="cursor-pointer">
                    Publish now
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="schedule" id="schedule" />
                  <Label htmlFor="schedule" className="cursor-pointer">
                    Schedule for later
                  </Label>
                </div>
              </RadioGroup>

              {publishType === "schedule" && (
                <div className="space-y-2 rounded-lg border p-4">
                  <Label>Date & Time</Label>
                  <input
                    type="datetime-local"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  />
                  <p className="text-xs text-muted-foreground">Timezone: PST (GMT-8)</p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="mr-2 h-4 w-4" />
                  Save as Draft
                </Button>
                <Button variant="gradient" onClick={handlePublish}>
                  <Send className="mr-2 h-4 w-4" />
                  {publishType === "now" ? "Publish Now" : "Schedule Post"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
