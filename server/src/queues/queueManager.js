const Bull = require('bull');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');

class QueueManager {
  constructor() {
    const redisConfig = {
      redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        db: parseInt(process.env.REDIS_DB_QUEUE) || 2,
        password: process.env.REDIS_PASSWORD || undefined,
      },
    };

    // Create queues
    this.publishQueue = new Bull('post-publishing', redisConfig);
    this.retryQueue = new Bull('post-retry', redisConfig);
    this.analyticsQueue = new Bull('analytics-sync', redisConfig);

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Publish queue events
    this.publishQueue.on('completed', (job, result) => {
      logger.info('✅ Publish job completed', {
        jobId: job.id,
        postId: job.data.postId,
        scheduleId: job.data.scheduleId,
        result,
      });
    });

    this.publishQueue.on('failed', (job, err) => {
      logger.error('❌ Publish job failed', {
        jobId: job.id,
        postId: job.data.postId,
        error: err.message,
      });
    });

    this.publishQueue.on('error', (error) => {
      logger.error('Queue error:', error);
    });
  }

  /**
   * Add publish job to queue
   */
  async addPublishJob(postId, scheduleId, scheduledFor, priority = 'normal') {
    try {
      const now = Date.now();
      const scheduledTime = new Date(scheduledFor).getTime();
      const delay = Math.max(0, scheduledTime - now);
      
      // VALIDATE DELAY
      if (delay === 0) {
        logger.warn('⚠️ Schedule time is in the past or now, publishing immediately', {
          scheduledFor: new Date(scheduledFor).toISOString(),
          currentTime: new Date(now).toISOString(),
        });
      }
      
      const priorityValue = {
        high: 1,
        normal: 2,
        low: 3,
      }[priority] || 2;

      const job = await this.publishQueue.add(
        {
          postId,
          scheduleId,
          scheduledFor,
        },
        {
          jobId: `${postId}_${scheduleId}`,
          delay,
          priority: priorityValue,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 60000, // 1 minute
          },
          removeOnComplete: false,
          removeOnFail: false,
        }
      );

      // IMPROVED LOGGING
      const delayMinutes = Math.round(delay / 1000 / 60);
      const delaySeconds = Math.round(delay / 1000);
      
      logger.info('📅 Publish job queued', {
        jobId: job.id,
        postId, 
        scheduleId,
        scheduledFor: new Date(scheduledFor).toISOString(),
        currentTime: new Date(now).toISOString(),
        delay: delayMinutes > 0 
          ? `${delayMinutes} minutes (${delaySeconds}s)` 
          : `${delaySeconds} seconds`,
        willPublishAt: new Date(now + delay).toISOString(),
      });

      return job.id;
    } catch (error) { 
      logger.error('Failed to queue publish job:', error);
      throw error;
    }
  }

  /**
   * Cancel scheduled job
   */
  async cancelJob(jobId) {
    try {
      const job = await this.publishQueue.getJob(jobId);
      if (job) {
        await job.remove();
        logger.info('🗑️ Job cancelled', { jobId });
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Failed to cancel job:', error);
      return false;
    }
  }

  /**
   * Retry failed job
   */
  async retryJob(postId, scheduleId) {
    try {
      const job = await this.retryQueue.add(
        {
          postId,
          scheduleId,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 120000, // 2 minutes
          },
        }
      );

      logger.info('🔄 Retry job queued', { jobId: job.id, postId, scheduleId });
      return job.id;
    } catch (error) {
      logger.error('Failed to queue retry job:', error);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.publishQueue.getWaitingCount(),
      this.publishQueue.getActiveCount(),
      this.publishQueue.getCompletedCount(),
      this.publishQueue.getFailedCount(),
      this.publishQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Clean old jobs
   */
  async cleanJobs() {
    const gracePeriod = 24 * 60 * 60 * 1000; // 24 hours
    await this.publishQueue.clean(gracePeriod, 'completed');
    await this.publishQueue.clean(gracePeriod * 7, 'failed'); // Keep failed jobs for 7 days
    logger.info('🧹 Queue cleanup completed');
  }
}

module.exports = new QueueManager();