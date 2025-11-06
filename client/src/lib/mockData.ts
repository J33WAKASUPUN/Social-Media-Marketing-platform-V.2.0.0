export const mockUser = {
  id: "1",
  name: "John Smith",
  email: "john@example.com",
  avatar: "",
  initials: "JS",
  timezone: "PST (GMT-8)",
};

export const mockChannels = [
  {
    id: "1",
    platform: "linkedin",
    name: "LinkedIn",
    username: "@johnsmith",
    followers: "2.5K",
    connected: true,
    connectedDate: "Dec 1, 2024",
  },
  {
    id: "2",
    platform: "facebook",
    name: "Facebook",
    username: "@johnsmithpage",
    followers: "1.2K",
    connected: true,
    connectedDate: "Nov 28, 2024",
  },
  {
    id: "3",
    platform: "twitter",
    name: "Twitter",
    username: "@jsmith",
    followers: "850",
    connected: true,
    connectedDate: "Nov 25, 2024",
  },
  {
    id: "4",
    platform: "instagram",
    name: "Instagram",
    username: "@john.smith",
    followers: "3.1K",
    connected: true,
    connectedDate: "Nov 20, 2024",
  },
  {
    id: "5",
    platform: "youtube",
    name: "YouTube",
    username: "",
    followers: "",
    connected: false,
    connectedDate: "",
  },
];

export type PostStatus = "scheduled" | "published" | "draft" | "failed";

export interface Post {
  id: string;
  content: string;
  platforms: string[];
  status: PostStatus;
  scheduledDate?: string;
  publishedDate?: string;
  media?: string[];
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export const mockPosts: Post[] = [
  {
    id: "1",
    content: "Excited to announce our new product launch! 🚀 Check it out at our website. This is going to revolutionize the way you work.",
    platforms: ["linkedin", "facebook"],
    status: "scheduled",
    scheduledDate: "Dec 20, 2024 10:00 AM",
    media: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"],
  },
  {
    id: "2",
    content: "5 tips for better social media engagement:\n1. Post consistently\n2. Use high-quality images\n3. Engage with your audience\n4. Use relevant hashtags\n5. Analyze your performance",
    platforms: ["twitter"],
    status: "published",
    publishedDate: "Dec 12, 2024",
    engagement: { likes: 145, comments: 23, shares: 12 },
    media: ["https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80"],
  },
  {
    id: "3",
    content: "Just wrapped up an amazing conference! Great insights on digital marketing trends for 2025.",
    platforms: ["linkedin", "twitter", "facebook"],
    status: "published",
    publishedDate: "Dec 10, 2024",
    engagement: { likes: 234, comments: 45, shares: 28 },
    media: ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"],
  },
  {
    id: "4",
    content: "Behind the scenes of our latest photoshoot! Can't wait to share the results with you all. Stay tuned! ✨",
    platforms: ["instagram"],
    status: "scheduled",
    scheduledDate: "Dec 18, 2024 3:00 PM",
    media: ["https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80", "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80"],
  },
  {
    id: "5",
    content: "Monday motivation: Success is not final, failure is not fatal. It's the courage to continue that counts.",
    platforms: ["linkedin", "facebook", "twitter"],
    status: "published",
    publishedDate: "Dec 11, 2024",
    engagement: { likes: 189, comments: 31, shares: 15 },
  },
  {
    id: "6",
    content: "Working on something exciting for our community. Details coming soon!",
    platforms: ["linkedin"],
    status: "draft",
    media: ["https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80"],
  },
  {
    id: "7",
    content: "Check out our latest blog post about content marketing strategies that actually work in 2024.",
    platforms: ["twitter", "facebook"],
    status: "published",
    publishedDate: "Dec 9, 2024",
    engagement: { likes: 92, comments: 12, shares: 8 },
    media: ["https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80"],
  },
  {
    id: "8",
    content: "Happy Friday! What are your weekend plans?",
    platforms: ["facebook", "instagram"],
    status: "scheduled",
    scheduledDate: "Dec 22, 2024 5:00 PM",
  },
];

export const mockNotifications = [
  {
    id: "1",
    type: "success",
    title: "Post published successfully",
    message: "Your post has been published to LinkedIn",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "error",
    title: "Failed to publish",
    message: "Failed to publish to Twitter: Connection expired",
    timestamp: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "info",
    title: "New team member",
    message: "Sarah Johnson joined your team",
    timestamp: "1 day ago",
    read: false,
  },
  {
    id: "4",
    type: "success",
    title: "Post published",
    message: "Your post has been published to Facebook",
    timestamp: "2 days ago",
    read: true,
  },
];

export const mockAnalytics = {
  totalPosts: 156,
  totalEngagement: 3247,
  bestPlatform: "linkedin",
  avgEngagementRate: 4.2,
  weeklyIncrease: 12,
  postingTrends: [
    { date: "Nov 15", posts: 8 },
    { date: "Nov 18", posts: 12 },
    { date: "Nov 21", posts: 7 },
    { date: "Nov 24", posts: 15 },
    { date: "Nov 27", posts: 10 },
    { date: "Nov 30", posts: 14 },
    { date: "Dec 3", posts: 9 },
    { date: "Dec 6", posts: 11 },
    { date: "Dec 9", posts: 13 },
    { date: "Dec 12", posts: 16 },
  ],
  platformDistribution: [
    { name: "LinkedIn", value: 35, color: "#0077B5" },
    { name: "Facebook", value: 30, color: "#1877F2" },
    { name: "Twitter", value: 20, color: "#1DA1F2" },
    { name: "Instagram", value: 15, color: "#E4405F" },
  ],
  postsByPlatform: [
    { platform: "LinkedIn", posts: 45 },
    { platform: "Facebook", posts: 32 },
    { platform: "Twitter", posts: 28 },
    { platform: "Instagram", posts: 21 },
  ],
  postingDays: [
    { day: "Mon", posts: 18 },
    { day: "Tue", posts: 25 },
    { day: "Wed", posts: 22 },
    { day: "Thu", posts: 30 },
    { day: "Fri", posts: 28 },
    { day: "Sat", posts: 15 },
    { day: "Sun", posts: 12 },
  ],
  platformPerformance: [
    { platform: "LinkedIn", totalPosts: 45, successRate: 98, engagement: 1245 },
    { platform: "Facebook", totalPosts: 32, successRate: 94, engagement: 876 },
    { platform: "Twitter", totalPosts: 28, successRate: 96, engagement: 654 },
    { platform: "Instagram", totalPosts: 21, successRate: 100, engagement: 472 },
  ],
  engagementOverTime: [
    { date: "Nov 15", likes: 120, comments: 25, shares: 15 },
    { date: "Nov 18", likes: 145, comments: 32, shares: 18 },
    { date: "Nov 21", likes: 98, comments: 18, shares: 10 },
    { date: "Nov 24", likes: 178, comments: 45, shares: 28 },
    { date: "Nov 27", likes: 134, comments: 28, shares: 16 },
    { date: "Nov 30", likes: 156, comments: 35, shares: 22 },
    { date: "Dec 3", likes: 112, comments: 22, shares: 12 },
    { date: "Dec 6", likes: 142, comments: 30, shares: 19 },
    { date: "Dec 9", likes: 165, comments: 38, shares: 24 },
    { date: "Dec 12", likes: 189, comments: 42, shares: 28 },
  ],
};

export const mockMedia = [
  {
    id: "1",
    filename: "product-launch.jpg",
    type: "image",
    size: "2.4 MB",
    dimensions: "1920x1080",
    uploadDate: "Dec 10, 2024",
    url: "/placeholder.svg",
    tags: ["product", "launch", "marketing"],
    altText: "Product launch banner",
    usedIn: 3,
  },
  {
    id: "2",
    filename: "team-photo.jpg",
    type: "image",
    size: "3.1 MB",
    dimensions: "2048x1536",
    uploadDate: "Dec 8, 2024",
    url: "/placeholder.svg",
    tags: ["team", "office", "culture"],
    altText: "Team photo at office",
    usedIn: 1,
  },
  {
    id: "3",
    filename: "infographic.png",
    type: "image",
    size: "1.8 MB",
    dimensions: "1080x1920",
    uploadDate: "Dec 5, 2024",
    url: "/placeholder.svg",
    tags: ["infographic", "data", "statistics"],
    altText: "Social media statistics infographic",
    usedIn: 2,
  },
];
