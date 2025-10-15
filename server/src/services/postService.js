const Post = require('../models/Post');
const Channel = require('../models/Channel');
const Membership = require('../models/Membership');
const queueManager = require('../queues/queueManager');
const logger = require('../utils/logger');

class PostService {
  /**
   * Create new post
   */
  async createPost(userId, data) {
    const { brandId, title, content, mediaUrls, schedules, settings } = data;

    // Check user access
    const membership = await Membership.findOne({
      user: userId,
      brand: brandId,
    });

    if (!membership || !membership.hasPermission('create_posts')) {
      throw new Error('Access denied');
    }

    // ✅ ENHANCED SCHEDULE VALIDATION WITH TIMEZONE LOGGING
    if (schedules && schedules.length > 0) {
      const now = new Date();
      const nowUTC = new Date(now.toISOString());
      
      // Get brand timezone (if set)
      const Brand = require('../models/Brand');
      const brand = await Brand.findById(brandId);
      const brandTimezone = brand?.settings?.timezone || 'UTC';
      
      logger.info('🕐 Timezone info', {
        serverTime: nowUTC.toISOString(),
        brandTimezone,
        localServerTime: now.toLocaleString('en-US', { timeZone: brandTimezone }),
      });
      
      for (const schedule of schedules) {
        const scheduledTime = new Date(schedule.scheduledFor);
        
        // Check if scheduled time is in the past (with 1 minute buffer)
        const oneMinuteAgo = new Date(nowUTC.getTime() - 60000);
        if (scheduledTime <= oneMinuteAgo) {
          // ✅ BETTER ERROR MESSAGE WITH TIMEZONE INFO
          const localNow = now.toLocaleString('en-US', { 
            timeZone: brandTimezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
          
          const localScheduled = scheduledTime.toLocaleString('en-US', {
            timeZone: brandTimezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
          
          throw new Error(
            `Invalid schedule time.\n\n` +
            `📍 Your timezone: ${brandTimezone}\n` +
            `⏰ Current time: ${localNow}\n` +
            `📅 Scheduled time: ${localScheduled}\n\n` +
            `The scheduled time must be in the future.`
          );
        }
        
        // Optional: Check if scheduled time is too far in the future (e.g., 1 year)
        const oneYearFromNow = new Date(nowUTC.getTime() + 365 * 24 * 60 * 60 * 1000);
        if (scheduledTime > oneYearFromNow) {
          throw new Error('Cannot schedule posts more than 1 year in advance');
        }
      }

      const channelIds = schedules.map(s => s.channelId);
      const channels = await Channel.find({
        _id: { $in: channelIds },
        brand: brandId,
      });

      if (channels.length !== channelIds.length) {
        throw new Error('Invalid channels');
      }

      // Build schedule objects
      const scheduleObjects = schedules.map(s => {
        const channel = channels.find(c => c._id.toString() === s.channelId);
        return {
          channel: channel._id,
          provider: channel.provider,
          scheduledFor: new Date(s.scheduledFor),
          status: 'pending',
        };
      });

      data.schedules = scheduleObjects;
    }

    // Determine post status
    const status = schedules && schedules.length > 0 ? 'scheduled' : 'draft';

    // Create post
    const post = await Post.create({
      brand: brandId,
      createdBy: userId,
      title,
      content,
      mediaUrls: mediaUrls || [],
      mediaType: this.detectMediaType(mediaUrls),
      schedules: data.schedules || [],
      status,
      settings: settings || {},
    });

    // Queue scheduled posts
    if (post.schedules && post.schedules.length > 0) {
      for (const schedule of post.schedules) {
        const jobId = await queueManager.addPublishJob(
          post._id.toString(),
          schedule._id.toString(),
          schedule.scheduledFor
        );

        schedule.jobId = jobId;
        
        // ✅ ENHANCED LOGGING WITH LOCAL TIME
        const Brand = require('../models/Brand');
        const brand = await Brand.findById(brandId);
        const brandTimezone = brand?.settings?.timezone || 'UTC';
        
        const localScheduledTime = schedule.scheduledFor.toLocaleString('en-US', {
          timeZone: brandTimezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        
        logger.info('📅 Post scheduled', {
          postId: post._id,
          scheduleId: schedule._id,
          scheduledForUTC: schedule.scheduledFor.toISOString(),
          scheduledForLocal: localScheduledTime,
          timezone: brandTimezone,
          provider: schedule.provider,
          delay: Math.round((new Date(schedule.scheduledFor) - new Date()) / 1000 / 60) + ' minutes',
        });
      }

      await post.save();
    }

    logger.info('📝 Post created', {
      postId: post._id,
      brandId,
      status,
      schedulesCount: post.schedules.length,
      createdAtUTC: post.createdAt.toISOString(),
    });

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
    const allowedUpdates = ['title', 'content', 'mediaUrls', 'settings'];
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
      /\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i.test(url)
    );

    if (hasVideo) return 'video';
    if (mediaUrls.length > 1) return 'multiImage';
    return 'image';
  }
}

module.exports = new PostService();