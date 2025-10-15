const cron = require('node-cron');
const Post = require('../models/Post');
const queueManager = require('../queues/queueManager');
const logger = require('../utils/logger');

class ScheduleChecker {
  constructor() {
    this.cronJob = null;
  }

  /**
   * Start cron job (runs every minute)
   */
  start() {
    // Run every minute
    this.cronJob = cron.schedule('* * * * *', async () => {
      await this.checkDueSchedules();
    });

    logger.info('⏰ Schedule checker cron job started (every 1 minute)');
  }

  /**
   * Stop cron job
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      logger.info('⏰ Schedule checker cron job stopped');
    }
  }

  /**
   * Check for due schedules and queue them
   */
  async checkDueSchedules() {
    try {
      const now = new Date();

      // Find posts with pending schedules that are due
      const posts = await Post.find({
        status: { $in: ['scheduled', 'draft'] },
        'schedules.status': 'pending',
        'schedules.scheduledFor': { $lte: now },
      }).populate('brand');

      if (posts.length === 0) {
        return;
      }

      logger.info(`📅 Found ${posts.length} posts with due schedules`);

      for (const post of posts) {
        const dueSchedules = post.schedules.filter(
          s => s.status === 'pending' && s.scheduledFor <= now
        );

        for (const schedule of dueSchedules) {
          try {
            // Queue the publish job
            const jobId = await queueManager.addPublishJob(
              post._id.toString(),
              schedule._id.toString(),
              schedule.scheduledFor,
              'high' // High priority for due posts
            );

            // Update schedule status to queued
            schedule.status = 'queued';
            schedule.jobId = jobId;
            post.status = 'publishing';

            logger.info('✅ Queued due schedule', {
              postId: post._id,
              scheduleId: schedule._id,
              jobId,
              scheduledFor: schedule.scheduledFor,
            });
          } catch (error) {
            logger.error('❌ Failed to queue schedule', {
              postId: post._id,
              scheduleId: schedule._id,
              error: error.message,
            });

            schedule.status = 'failed';
            schedule.error = error.message;
          }
        }

        await post.save();
      }
    } catch (error) {
      logger.error('❌ Schedule checker error:', error);
    }
  }
}

module.exports = new ScheduleChecker();