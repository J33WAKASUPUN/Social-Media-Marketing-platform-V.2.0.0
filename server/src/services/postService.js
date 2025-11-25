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

  // ✅ VALIDATE SCHEDULES AND DETERMINE STATUS
  let status = 'draft';
  
  if (schedules && schedules.length > 0) {
    const now = new Date();
    
    logger.info('🕐 Timezone info', {
      serverTime: now.toISOString(),
      serverLocalTime: now.toLocaleString(),
      serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    for (const schedule of schedules) {
      const scheduledDate = new Date(schedule.scheduledFor);
      
      // ✅ FIX: If scheduled within 30 seconds, treat as "publish now"
      const thirtySecondsFromNow = new Date(now.getTime() + 30 * 1000);
      
      logger.info('📅 Schedule validation', {
        scheduledFor: scheduledDate.toISOString(),
        now: now.toISOString(),
        thirtySecondsFromNow: thirtySecondsFromNow.toISOString(),
        isImmediate: scheduledDate <= thirtySecondsFromNow,
      });

      // Validate channel exists
      const channel = await Channel.findById(schedule.channel);
      if (!channel) {
        throw new Error(`Channel ${schedule.channel} not found`);
      }

      if (channel.connectionStatus !== 'active') {
        throw new Error(`Channel ${channel.displayName} is not active`);
      }
    }

    // ✅ Determine status based on first schedule
    const firstSchedule = new Date(schedules[0].scheduledFor);
    const thirtySecondsFromNow = new Date(now.getTime() + 30 * 1000);
    
    if (firstSchedule <= thirtySecondsFromNow) {
      status = 'publishing'; // ✅ Set to "publishing" for immediate posts
    } else {
      status = 'scheduled'; // ✅ Set to "scheduled" for future posts
    }
  }

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
    status, // ✅ Use calculated status
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
    try {
      // Check user access
      const membership = await Membership.findOne({
        user: userId,
        brand: brandId,
      });

      if (!membership || !membership.hasPermission('create_posts')) {
        throw new Error('Permission denied');
      }

      // Build query
      const query = { brand: brandId };

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.createdBy) {
        query.createdBy = filters.createdBy;
      }

      // Fetch posts with populated data
      const posts = await Post.find(query)
        .populate('createdBy', 'name email avatar')
        .populate({
          path: 'schedules.channel',
          select: 'provider displayName avatar platformUsername',
        })
        .populate({
          path: 'mediaLibraryItems',
          select: 's3Url originalName type size',
        })
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50);

      logger.info('✅ Posts fetched', {
        brandId,
        count: posts.length,
        filters,
      });

      return posts;
    } catch (error) {
      logger.error('❌ Get brand posts failed', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

/**
 * Update post (only for drafts and scheduled posts)
 */
async updatePost(userId, postId, data) {
  const post = await Post.findById(postId);

  if (!post) {
    throw new Error('Post not found');
  }

  // ✅ PREVENT EDITING PUBLISHED POSTS
  if (post.status === 'published') {
    throw new Error('Cannot edit published posts. Please manage them on the platform.');
  }

  // Check permission
  const membership = await Membership.findOne({
    user: userId,
    brand: post.brand,
  });

  if (!membership || !membership.hasPermission('create_posts')) {
    throw new Error('Access denied');
  }

  // ✅ UPDATE FIELDS
  if (data.content !== undefined) {
    post.content = data.content;
  }

  if (data.title !== undefined) {
    post.title = data.title;
  }

  if (data.hashtags !== undefined) {
    post.hashtags = data.hashtags;
  }

  // ✅ UPDATE SCHEDULE TIME
  if (data.schedules && data.schedules.length > 0) {
    for (const newSchedule of data.schedules) {
      const existingSchedule = post.schedules.find(
        s => s.channel.toString() === newSchedule.channel
      );

      if (existingSchedule) {
        const oldScheduledFor = existingSchedule.scheduledFor;
        existingSchedule.scheduledFor = new Date(newSchedule.scheduledFor);

        // ✅ CANCEL OLD JOB AND CREATE NEW ONE
        if (existingSchedule.jobId) {
          const queueManager = require('../queues/queueManager');
          await queueManager.cancelJob(existingSchedule.jobId);
          
          logger.info('✅ Old job cancelled', { 
            jobId: existingSchedule.jobId,
            oldScheduledFor,
          });

          // Create new job
          const newJobId = await queueManager.addPublishJob(
            post._id.toString(),
            existingSchedule._id.toString(),
            existingSchedule.scheduledFor,
            'normal'
          );

          existingSchedule.jobId = newJobId;

          logger.info('✅ New job created', { 
            jobId: newJobId,
            newScheduledFor: existingSchedule.scheduledFor,
          });
        }

        // Reset status to pending
        existingSchedule.status = 'pending';
      }
    }
  }

  await post.save();

  logger.info('✅ Post updated', { postId });

  return post;
}

  /**
   * Delete post (from DB AND platform if published)
   */
  async deletePost(userId, postId) {
    try {
      // Find post
      const post = await Post.findById(postId)
        .populate('brand')
        .populate('schedules.channel');

      if (!post) {
        throw new Error('Post not found');
      }

      // Check user access
      const membership = await Membership.findOne({
        user: userId,
        brand: post.brand._id,
      });

      if (!membership || !membership.hasPermission('create_posts')) {
        throw new Error('Permission denied');
      }

      const deletionResults = {
        database: { success: false, message: '' },
        platforms: [],
      };

      // ✅ DELETE FROM PLATFORM(S) IF PUBLISHED
      if (post.status === 'published') {
        logger.info('🗑️ Deleting published post from platforms', {
          postId: post._id,
          schedules: post.schedules.length,
        });

        for (const schedule of post.schedules) {
          if (schedule.status === 'published' && schedule.platformPostId) {
            try {
              const channel = schedule.channel;
              if (!channel) {
                logger.warn('⚠️ Channel not found for schedule', {
                  scheduleId: schedule._id,
                });
                continue;
              }

              const provider = ProviderFactory.getProvider(schedule.provider, channel);
              
              logger.info('🗑️ Deleting from platform', {
                provider: schedule.provider,
                platformPostId: schedule.platformPostId,
              });

              await provider.deletePost(schedule.platformPostId);

              deletionResults.platforms.push({
                platform: schedule.provider,
                success: true,
                message: 'Deleted successfully',
              });

              logger.info('✅ Deleted from platform', {
                provider: schedule.provider,
                platformPostId: schedule.platformPostId,
              });
            } catch (error) {
              logger.error('❌ Failed to delete from platform', {
                provider: schedule.provider,
                error: error.message,
              });

              deletionResults.platforms.push({
                platform: schedule.provider,
                success: false,
                message: error.message,
              });
            }
          }
        }
      }

      // ✅ DELETE FROM DATABASE (ALWAYS)
      await Post.findByIdAndDelete(postId);
      await PublishedPost.deleteMany({ post: postId });

      deletionResults.database = {
        success: true,
        message: 'Post deleted from database',
      };

      logger.info('✅ Post deleted', {
        postId,
        databaseDeleted: true,
        platformsAttempted: deletionResults.platforms.length,
      });

      return {
        success: true,
        message: this.formatDeletionMessage(deletionResults),
        details: deletionResults,
      };
    } catch (error) {
      logger.error('❌ Delete post failed', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Format deletion result message
   */
  formatDeletionMessage(results) {
    const { database, platforms } = results;

    if (platforms.length === 0) {
      return 'Post deleted successfully';
    }

    const successful = platforms.filter(p => p.success);
    const failed = platforms.filter(p => !p.success);

    if (failed.length === 0) {
      return `Post deleted from database and ${successful.length} platform(s)`;
    }

    if (successful.length === 0) {
      return `Post deleted from database, but failed to delete from platforms: ${failed.map(f => f.platform).join(', ')}`;
    }

    return `Post deleted from database and ${successful.length} platform(s). Failed on: ${failed.map(f => f.platform).join(', ')}`;
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

  // ✅ Cancel queue job if exists
  if (schedule.jobId) {
    const queueManager = require('../queues/queueManager');
    const cancelled = await queueManager.cancelJob(schedule.jobId);
    
    if (cancelled) {
      logger.info('✅ Queue job cancelled', { jobId: schedule.jobId });
    }
  }

  // ✅ Update schedule status
  schedule.status = 'cancelled';
  
  // ✅ Update post status
  // If all schedules are cancelled, set post to draft
  const allCancelled = post.schedules.every(s => 
    s._id.equals(schedule._id) || s.status === 'cancelled'
  );
  
  if (allCancelled) {
    post.status = 'draft';
  }
  
  await post.save();

  logger.info('✅ Schedule cancelled', { postId, scheduleId });

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