const Post = require('../models/Post');
const PublishedPost = require('../models/PublishedPost');
const Channel = require('../models/Channel');
const ProviderFactory = require('../providers/ProviderFactory');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

class PublishPostJob {
  /**
   * Process publish job
   */
  async process(job) {
    const { postId, scheduleId } = job.data;

    logger.info('📤 Processing publish job', { postId, scheduleId, jobId: job.id });

    try {
      // 1. Load post and schedule
      const post = await Post.findById(postId).populate('brand createdBy');
      if (!post) {
        throw new Error(`Post ${postId} not found`);
      }

      const schedule = post.schedules.id(scheduleId);
      if (!schedule) {
        throw new Error(`Schedule ${scheduleId} not found`);
      }

      // 2. Check if already published
      if (schedule.status === 'published') {
        logger.warn('Schedule already published, skipping', { scheduleId });
        return { success: true, message: 'Already published' };
      }

      // 3. Load channel
      const channel = await Channel.findById(schedule.channel);
      if (!channel) {
        throw new Error(`Channel ${schedule.channel} not found`);
      }

      // 4. Check channel connection
      if (channel.connectionStatus !== 'active') {
        throw new Error(`Channel ${channel.displayName} is disconnected`);
      }

      // 5. Get provider and publish
      const provider = ProviderFactory.getProvider(schedule.provider, channel);
      const publishResult = await provider.publish({
        title: post.title,
        content: post.content,
        mediaUrls: post.mediaUrls,
      });

      // 6. Update schedule status
      schedule.status = 'published';
      schedule.publishedAt = new Date();
      schedule.platformPostId = publishResult.id;

      // Update post status
      const allPublished = post.schedules.every(s => s.status === 'published');
      post.status = allPublished ? 'published' : 'publishing';
      post.publishedCount += 1;

      await post.save();

      // 7. Create PublishedPost record
      await PublishedPost.create({
        post: post._id,
        brand: post.brand._id,
        channel: channel._id,
        publishedBy: post.createdBy._id,
        provider: schedule.provider,
        platformPostId: publishResult.id,
        platformUrl: publishResult.url,
        title: post.title,
        content: post.content,
        mediaUrls: post.mediaUrls,
        mediaType: post.mediaType,
        status: 'published',
        publishedAt: new Date(),
      });

      // 8. Send success notification
      if (post.settings.notifyOnPublish) {
        await emailService.sendPostPublishedEmail(
          post.createdBy.email,
          post.createdBy.name,
          {
            id: post._id,
            content: post.content.substring(0, 200),
            platforms: [schedule.provider],
            publishedAt: new Date(),
          }
        );
      }

      logger.info('✅ Post published successfully', {
        postId,
        scheduleId,
        provider: schedule.provider,
        platformPostId: publishResult.id,
      });

      return {
        success: true,
        platformPostId: publishResult.id,
        platformUrl: publishResult.url,
      };
    } catch (error) {
      logger.error('❌ Publish job failed', {
        postId,
        scheduleId,
        error: error.message,
        stack: error.stack,
      });

      // Update schedule with error
      const post = await Post.findById(postId).populate('createdBy');
      if (post) {
        const schedule = post.schedules.id(scheduleId);
        if (schedule) {
          schedule.status = 'failed';
          schedule.error = error.message;
          schedule.retryCount += 1;
          post.failedCount += 1;
          post.status = 'failed';
          await post.save();

          // Send failure notification
          if (post.settings.notifyOnPublish) {
            await emailService.sendPostFailedEmail(
              post.createdBy.email,
              post.createdBy.name,
              {
                id: post._id,
                content: post.content.substring(0, 200),
                platforms: [schedule.provider],
              },
              error.message
            );
          }
        }
      }

      throw error;
    }
  }
}

module.exports = new PublishPostJob();