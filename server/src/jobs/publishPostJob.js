const Post = require('../models/Post');
const PublishedPost = require('../models/PublishedPost');
const Channel = require('../models/Channel');
const ProviderFactory = require('../providers/ProviderFactory');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

class PublishPostJob {
  async process(job) {
    const { postId, scheduleId } = job.data;

    try {
      logger.info('📤 Publishing post', { postId, scheduleId });

      // 1. Find post
      const post = await Post.findById(postId)
        .populate('createdBy', 'name email')
        .populate('brand', 'name');

      if (!post) {
        throw new Error(`Post ${postId} not found`);
      }

      logger.info('✅ Post found', {
        postId: post._id,
        content: post.content.substring(0, 50) + '...',
        status: post.status,
      });

      // 2. Find schedule
      const schedule = post.schedules.id(scheduleId);
      if (!schedule) {
        throw new Error(`Schedule ${scheduleId} not found`);
      }

      logger.info('✅ Schedule found', {
        scheduleId: schedule._id,
        provider: schedule.provider,
        scheduledFor: schedule.scheduledFor,
        status: schedule.status,
      });

      if (schedule.status !== 'pending' && schedule.status !== 'queued') {
        logger.warn(`⚠️ Schedule ${scheduleId} already processed (${schedule.status})`);
        return;
      }

      // 3. Get channel
      const channel = await Channel.findById(schedule.channel);
      if (!channel) {
        throw new Error(`Channel ${schedule.channel} not found`);
      }

      logger.info('✅ Channel found', {
        channelId: channel._id,
        provider: channel.provider,
        displayName: channel.displayName,
        connectionStatus: channel.connectionStatus,
      });

      if (channel.connectionStatus !== 'active') {
        throw new Error(`Channel ${channel.provider} is not active (status: ${channel.connectionStatus})`);
      }

      // 5. Get provider instance
      const provider = ProviderFactory.getProvider(channel.provider, channel);

      logger.info('🚀 Publishing to platform', {
        provider: channel.provider,
        hasContent: !!post.content,
        hasMedia: post.mediaUrls?.length > 0,
        mediaCount: post.mediaUrls?.length || 0,
      });

      // 6. Publish to platform
      const publishResult = await provider.publish({
        content: post.content,
        title: post.title,
        mediaUrls: post.mediaUrls || [],
      });

      logger.info('✅ Platform publish successful', {
        platformPostId: publishResult.id || publishResult.platformPostId,
        platformUrl: publishResult.url || publishResult.platformUrl,
      });

      // 7. Update schedule status
      schedule.status = 'published';
      schedule.publishedAt = new Date();
      schedule.platformPostId = publishResult.id || publishResult.platformPostId;
      schedule.platformUrl = publishResult.url || publishResult.platformUrl;
      await post.save();

      // 8. Create PublishedPost record
      const publishedPost = await PublishedPost.create({
        post: post._id,
        brand: post.brand._id,
        channel: channel._id,
        publishedBy: post.createdBy._id,
        provider: schedule.provider,
        platformPostId: publishResult.id || publishResult.platformPostId,
        platformUrl: publishResult.url || publishResult.platformUrl,
        title: post.title,
        content: post.content,
        mediaUrls: post.mediaUrls || [],
        mediaType: post.mediaType || 'none',
        status: 'published',
        publishedAt: new Date(),
      });

      logger.info('✅ PublishedPost record created', {
        publishedPostId: publishedPost._id,
      });

      // 9. SEND SUCCESS NOTIFICATION (NON-BLOCKING)
      // ⚠️ CRITICAL FIX: Don't await - run in background
      notificationService.notifyPostPublished(
        post.createdBy._id,
        post.brand._id,
        {
          postId: post._id,
          content: post.content,
          platform: schedule.provider,
          platformPostId: publishResult.id || publishResult.platformPostId,
          platformUrl: publishResult.url || publishResult.platformUrl,
        }
      ).catch(err => {
        // Log but don't fail the job
        logger.error('⚠️ Notification failed (non-critical)', {
          error: err.message,
          postId,
        });
      });

      // 10. Send email notification (NON-BLOCKING)
      if (post.settings?.notifyOnPublish) {
        emailService.sendPostPublishedEmail(
          post.createdBy.email,
          post.createdBy.name,
          {
            content: post.content,
            platforms: [schedule.provider],
            publishedAt: new Date(),
            id: post._id,
          }
        ).catch(err => {
          logger.error('⚠️ Email failed (non-critical)', {
            error: err.message,
            postId,
          });
        });
      }

      logger.info('✅ Post published successfully', {
        postId,
        scheduleId,
        platformPostId: publishResult.id || publishResult.platformPostId,
        platformUrl: publishResult.url || publishResult.platformUrl,
      });

      // Return success immediately (notifications run in background)
      return {
        success: true,
        platformPostId: publishResult.id || publishResult.platformPostId,
        platformUrl: publishResult.url || publishResult.platformUrl,
      };

    } catch (error) {
      // ENHANCED ERROR LOGGING
      logger.error('❌ Post publishing failed - DETAILED ERROR:', {
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name,
        postId,
        scheduleId,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
        responseHeaders: error.response?.headers,
      });

      // Update schedule status
      const post = await Post.findById(postId).populate('createdBy');
      if (post) {
        const schedule = post.schedules.id(scheduleId);
        if (schedule) {
          schedule.status = 'failed';
          schedule.error = error.message;
          schedule.attempts = (schedule.attempts || 0) + 1;
          await post.save();

          // SEND FAILURE NOTIFICATION (NON-BLOCKING)
          notificationService.notifyPostFailed(
            post.createdBy._id,
            post.brand._id,
            {
              postId: post._id,
              content: post.content,
              platform: schedule.provider,
            },
            error.message
          ).catch(err => {
            logger.error('⚠️ Failure notification failed', {
              error: err.message,
            });
          });

          // Send email notification (NON-BLOCKING)
          if (post.settings?.notifyOnPublish !== false) {
            emailService.sendPostFailedEmail(
              post.createdBy.email,
              post.createdBy.name,
              {
                content: post.content,
                platform: schedule.provider,
                error: error.message,
                id: post._id,
              }
            ).catch(err => {
              logger.error('⚠️ Failure email failed', {
                error: err.message,
              });
            });
          }
        }
      }

      throw error;
    }
  }
}

module.exports = new PublishPostJob();