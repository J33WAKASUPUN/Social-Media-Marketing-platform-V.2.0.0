const Post = require('../models/Post');
const Channel = require('../models/Channel');
const Membership = require('../models/Membership');
const Media = require('../models/Media');
const queueManager = require('../queues/queueManager');
const logger = require('../utils/logger');

class PostService {
  /**
   * Create new post
   */
  async createPost(userId, data) {
    const { brandId, title, content, hashtags, mediaUrls, mediaLibraryIds, schedules, settings } = data;

    // Check user access
    const membership = await Membership.findOne({
      user: userId,
      brand: brandId,
    });

    if (!membership || !membership.hasPermission('create_posts')) {
      throw new Error('Permission denied');
    }

    // HANDLE MEDIA FROM LIBRARY
    let finalMediaUrls = mediaUrls || [];
    
    if (mediaLibraryIds && mediaLibraryIds.length > 0) {
      console.log('📚 Using media from library', { mediaLibraryIds });
      const mediaItems = await Media.find({ _id: { $in: mediaLibraryIds } });
      finalMediaUrls = [...finalMediaUrls, ...mediaItems.map(m => m.s3Url)];
      console.log('✅ Media from library loaded', { count: mediaItems.length });
    }

    if (schedules && schedules.length > 0) {
      const now = new Date();
      
      logger.info('🕐 Timezone info', {
        serverTime: now.toISOString(),
        serverLocalTime: now.toLocaleString(),
        serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      for (const schedule of schedules) {
        const scheduledDate = new Date(schedule.scheduledFor);
        
        // Allow posts scheduled within the last 5 minutes (for "Publish Now")
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        
        logger.info('📅 Schedule validation', {
          scheduledFor: scheduledDate.toISOString(),
          now: now.toISOString(),
          fiveMinutesAgo: fiveMinutesAgo.toISOString(),
          isValid: scheduledDate >= fiveMinutesAgo,
        });

        if (scheduledDate < fiveMinutesAgo) {
          throw new Error(
            `scheduledFor must be in the future or within the last 5 minutes (got: ${schedule.scheduledFor})`
          );
        }

        // Validate channel exists
        const channel = await Channel.findById(schedule.channel);
        if (!channel) {
          throw new Error(`Channel ${schedule.channel} not found`);
        }

        if (channel.connectionStatus !== 'active') {
          throw new Error(`Channel ${channel.displayName} is not active`);
        }
      }
    }

    // Determine post status
    const status = schedules && schedules.length > 0 ? 'scheduled' : 'draft';

    // Create post
    const post = await Post.create({
      brand: brandId,
      createdBy: userId,
      title,
      content,
      hashtags: hashtags || [],
      mediaUrls: finalMediaUrls,
      mediaType: this.detectMediaType(finalMediaUrls),
      schedules: data.schedules || [],
      status,
      settings: settings || {},
    });

    // MARK LIBRARY MEDIA AS USED
    if (mediaLibraryIds && mediaLibraryIds.length > 0) {
      await Media.updateMany(
        { _id: { $in: mediaLibraryIds } },
        {
          $inc: { usageCount: 1 },
          $set: { lastUsedAt: new Date() },
          $addToSet: { usedInPosts: post._id },
        }
      );
    }

    // ✅ QUEUE PUBLISHING JOBS
    if (schedules && schedules.length > 0) {
      const queueManager = require('../queues/queueManager');
      
      for (const schedule of post.schedules) {
        const scheduledDate = new Date(schedule.scheduledFor);
        const delay = Math.max(0, scheduledDate.getTime() - Date.now());

        logger.info('📤 Queueing publish job', {
          postId: post._id,
          scheduleId: schedule._id,
          scheduledFor: schedule.scheduledFor,
          delay: `${Math.round(delay / 1000)}s`,
        });

        await queueManager.addPublishJob(
          post._id.toString(),
          schedule._id.toString(),
          schedule.scheduledFor,
          delay === 0 ? 'high' : 'normal' // High priority for immediate posts
        );
      }
    }

    return post;
  }


  /**
   * Get brand posts
   */
  async getBrandPosts(userId, brandId, filters = {}) {
    // Check access
    const membership = await Membership.findOne({
      user: userId,
      brand: brandId,
    });

    if (!membership) {
      throw new Error('Access denied');
    }

    const query = { brand: brandId };

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.createdBy) {
      query.createdBy = filters.createdBy;
    }

    const posts = await Post.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('schedules.channel', 'provider displayName')
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50);

    return posts;
  }

  /**
   * Update post
   */
  async updatePost(userId, postId, data) {
    const post = await Post.findById(postId).populate('brand');

    if (!post) {
      throw new Error('Post not found');
    }

    // Check permission
    const membership = await Membership.findOne({
      user: userId,
      brand: post.brand._id,
    });

    if (!membership || !membership.hasPermission('create_posts')) {
      throw new Error('Access denied');
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'content', 'hashtags', 'mediaUrls', 'settings'];
    Object.keys(data).forEach(key => {
      if (allowedUpdates.includes(key)) {
        post[key] = data[key];
      }
    });

    if (data.mediaUrls) {
      post.mediaType = this.detectMediaType(data.mediaUrls);
    }

    await post.save();

    return post;
  }

  /**
   * Cancel scheduled post
   */
  async cancelSchedule(userId, postId, scheduleId) {
    const post = await Post.findById(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    // Check permission
    const membership = await Membership.findOne({
      user: userId,
      brand: post.brand,
    });

    if (!membership || !membership.hasPermission('create_posts')) {
      throw new Error('Access denied');
    }

    const schedule = post.schedules.id(scheduleId);

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    if (schedule.status === 'published') {
      throw new Error('Cannot cancel published post');
    }

    // Cancel queue job
    if (schedule.jobId) {
      await queueManager.cancelJob(schedule.jobId);
    }

    schedule.status = 'cancelled';
    await post.save();

    logger.info('🗑️ Schedule cancelled', { postId, scheduleId });

    return post;
  }

  /**
   * Get calendar view
   */
  async getCalendar(userId, brandId, startDate, endDate) {
    // Check access
    const membership = await Membership.findOne({
      user: userId,
      brand: brandId,
    });

    if (!membership) {
      throw new Error('Access denied');
    }

    const posts = await Post.find({
      brand: brandId,
      'schedules.scheduledFor': {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate('createdBy', 'name avatar')
      .populate('schedules.channel', 'provider displayName')
      .sort({ 'schedules.scheduledFor': 1 });

    // Group by date
    const calendar = {};

    posts.forEach(post => {
      post.schedules.forEach(schedule => {
        const date = schedule.scheduledFor.toISOString().split('T')[0];

        if (!calendar[date]) {
          calendar[date] = [];
        }

        calendar[date].push({
          postId: post._id,
          scheduleId: schedule._id,
          title: post.title,
          content: post.content,
          mediaUrls: post.mediaUrls,
          channel: schedule.channel,
          scheduledFor: schedule.scheduledFor,
          status: schedule.status,
          createdBy: post.createdBy,
        });
      });
    });

    return calendar;
  }

  /**
   * Detect media type from URLs
   */
  detectMediaType(mediaUrls) {
    if (!mediaUrls || mediaUrls.length === 0) return 'none';

    const hasVideo = mediaUrls.some(url =>
      /\.(mp4|mov|avi|wmv|webm)$/i.test(url)
    );

    if (hasVideo) return 'video';
    if (mediaUrls.length > 1) return 'multiImage';
    return 'image';
  }
}

module.exports = new PostService();