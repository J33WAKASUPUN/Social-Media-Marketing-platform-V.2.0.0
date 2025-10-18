const PublishedPost = require('../models/PublishedPost');
const Post = require('../models/Post');
const Channel = require('../models/Channel');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

class AnalyticsService {
  /**
   * Get comprehensive dashboard metrics
   * @param {string} brandId - Brand ObjectId
   * @param {string} dateRange - '7d', '30d', '90d', 'all'
   * @returns {Object} Dashboard analytics
   */
  async getDashboardMetrics(brandId, dateRange = '30d') {
    try {
      const startDate = this.getStartDate(dateRange);
      
      // 1️⃣ GET ALL PUBLISHED POSTS
      const publishedPosts = await PublishedPost.find({
        brand: brandId,
        publishedAt: { $gte: startDate },
        status: 'published',
      }).populate('channel', 'provider displayName avatar');

      // 2️⃣ GET FAILED POSTS
      const failedPosts = await PublishedPost.find({
        brand: brandId,
        publishedAt: { $gte: startDate },
        status: 'failed',
      });

      // 3️⃣ GET SCHEDULED POSTS (FUTURE)
      const scheduledPosts = await Post.find({
        brand: brandId,
        status: 'scheduled',
        'schedules.scheduledFor': { $gte: new Date() },
      });

      // 4️⃣ GET ACTIVE CHANNELS
      const activeChannels = await Channel.find({
        brand: brandId,
        connectionStatus: 'active',
      });

      // 5️⃣ CALCULATE SUMMARY METRICS
      const totalPublished = publishedPosts.length;
      const totalFailed = failedPosts.length;
      const totalScheduled = scheduledPosts.length;
      const totalChannels = activeChannels.length;

      const successRate = totalPublished + totalFailed > 0
        ? ((totalPublished / (totalPublished + totalFailed)) * 100).toFixed(2)
        : 100;

      const daysInRange = this.getDaysInRange(dateRange);
      const postsPerDay = daysInRange > 0
        ? (totalPublished / daysInRange).toFixed(2)
        : 0;

      // 6️⃣ GROUP BY PLATFORM
      const platformStats = this.groupByPlatform(publishedPosts);

      // 7️⃣ GROUP BY CONTENT TYPE
      const contentTypeStats = this.groupByContentType(publishedPosts);

      // 8️⃣ CALCULATE POSTING TRENDS
      const postingTrends = this.calculateTrends(publishedPosts, daysInRange);

      // 9️⃣ GET TOP POSTING DAYS
      const topPostingDays = this.getTopPostingDays(publishedPosts);

      // 🔟 GET RECENT ACTIVITY
      const recentActivity = await this.getRecentActivity(brandId, 10);

      return {
        summary: {
          totalPublished,
          totalFailed,
          totalScheduled,
          totalChannels,
          successRate: parseFloat(successRate),
          postsPerDay: parseFloat(postsPerDay),
          period: dateRange,
          dateRange: {
            start: startDate.toISOString(),
            end: new Date().toISOString(),
          },
        },
        platformStats,
        contentTypeStats,
        postingTrends,
        topPostingDays,
        recentActivity,
      };
    } catch (error) {
      logger.error('Dashboard metrics failed', error);
      throw error;
    }
  }

  /**
   * Group published posts by platform
   */
  groupByPlatform(posts) {
    const platformMap = {};

    posts.forEach(post => {
      const provider = post.provider || post.channel?.provider || 'unknown';
      
      if (!platformMap[provider]) {
        platformMap[provider] = {
          provider,
          totalPosts: 0,
          uniqueChannels: new Set(),
        };
      }

      platformMap[provider].totalPosts++;
      if (post.channel?._id) {
        platformMap[provider].uniqueChannels.add(post.channel._id.toString());
      }
    });

    return Object.values(platformMap).map(stat => ({
      provider: stat.provider,
      totalPosts: stat.totalPosts,
      totalChannels: stat.uniqueChannels.size,
      percentage: posts.length > 0
        ? ((stat.totalPosts / posts.length) * 100).toFixed(1)
        : 0,
    })).sort((a, b) => b.totalPosts - a.totalPosts);
  }

  /**
   * Group by content type
   */
  groupByContentType(posts) {
    const types = {
      text: 0,
      image: 0,
      video: 0,
      carousel: 0,
      unknown: 0,
    };

    posts.forEach(post => {
      const type = post.mediaType || 'text';
      if (types[type] !== undefined) {
        types[type]++;
      } else {
        types.unknown++;
      }
    });

    const total = posts.length;

    return Object.entries(types)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate posting trends over time
   */
  calculateTrends(posts, daysInRange) {
    const trends = {};
    const today = new Date();

    // Initialize all dates in range
    for (let i = daysInRange - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      trends[dateKey] = {
        date: dateKey,
        posts: 0,
        platforms: new Set(),
      };
    }

    // Count posts per day
    posts.forEach(post => {
      if (post.publishedAt) {
        const dateKey = post.publishedAt.toISOString().split('T')[0];
        if (trends[dateKey]) {
          trends[dateKey].posts++;
          trends[dateKey].platforms.add(post.provider || 'unknown');
        }
      }
    });

    return Object.values(trends)
      .map(day => ({
        date: day.date,
        posts: day.posts,
        platforms: day.platforms.size,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Get top posting days of the week
   */
  getTopPostingDays(posts) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
    };

    posts.forEach(post => {
      if (post.publishedAt) {
        const dayIndex = new Date(post.publishedAt).getDay();
        dayCounts[dayIndex]++;
      }
    });

    return Object.entries(dayCounts)
      .map(([index, count]) => ({
        day: dayNames[parseInt(index)],
        posts: count,
        percentage: posts.length > 0
          ? ((count / posts.length) * 100).toFixed(1)
          : 0,
      }))
      .sort((a, b) => b.posts - a.posts);
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(brandId, limit = 10) {
    return await PublishedPost.find({
      brand: brandId,
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .populate('channel', 'provider displayName avatar')
      .select('content platformUrl publishedAt provider status mediaType');
  }

  /**
   * Get channel performance statistics
   */
  async getChannelPerformance(brandId) {
    try {
      const channels = await Channel.find({
        brand: brandId,
      });

      const performance = await Promise.all(
        channels.map(async (channel) => {
          const published = await PublishedPost.countDocuments({
            channel: channel._id,
            status: 'published',
          });

          const failed = await PublishedPost.countDocuments({
            channel: channel._id,
            status: 'failed',
          });

          const lastPost = await PublishedPost.findOne({
            channel: channel._id,
            status: 'published',
          })
            .sort({ publishedAt: -1 })
            .select('publishedAt');

          return {
            channelId: channel._id,
            provider: channel.provider,
            displayName: channel.displayName,
            avatar: channel.avatar,
            connectionStatus: channel.connectionStatus,
            totalPosts: published,
            failedPosts: failed,
            successRate: published + failed > 0
              ? ((published / (published + failed)) * 100).toFixed(2)
              : 100,
            lastPostAt: lastPost?.publishedAt || null,
          };
        })
      );

      return performance.sort((a, b) => b.totalPosts - a.totalPosts);
    } catch (error) {
      logger.error('Channel performance failed', error);
      throw error;
    }
  }

  /**
   * Get posting trends for charts
   */
  async getPostingTrends(brandId, dateRange = '30d') {
    try {
      const startDate = this.getStartDate(dateRange);

      const posts = await PublishedPost.aggregate([
        {
          $match: {
            brand: new mongoose.Types.ObjectId(brandId),
            publishedAt: { $gte: startDate },
            status: 'published',
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$publishedAt' },
            },
            count: { $sum: 1 },
            platforms: { $addToSet: '$provider' },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      return posts.map(p => ({
        date: p._id,
        posts: p.count,
        platforms: p.platforms.length,
      }));
    } catch (error) {
      logger.error('Posting trends failed', error);
      throw error;
    }
  }

  /**
   * Export analytics to CSV format
   */
  async exportToCSV(brandId, dateRange = '30d') {
    try {
      const startDate = this.getStartDate(dateRange);

      const posts = await PublishedPost.find({
        brand: brandId,
        publishedAt: { $gte: startDate },
      })
        .populate('channel', 'provider displayName')
        .sort({ publishedAt: -1 });

      const csvRows = [
        ['Date', 'Platform', 'Channel', 'Content', 'Status', 'URL'].join(','),
      ];

      posts.forEach(post => {
        const row = [
          post.publishedAt.toISOString(),
          post.provider || 'N/A',
          post.channel?.displayName || 'N/A',
          `"${(post.content || '').substring(0, 50).replace(/"/g, '""')}"`,
          post.status,
          post.platformUrl || 'N/A',
        ].join(',');
        csvRows.push(row);
      });

      return csvRows.join('\n');
    } catch (error) {
      logger.error('CSV export failed', error);
      throw error;
    }
  }

  // ========== HELPER METHODS ==========

  /**
   * Calculate start date based on range
   */
  getStartDate(dateRange) {
    const now = new Date();
    
    if (dateRange === 'all') {
      return new Date(0); // Beginning of time
    }

    const days = parseInt(dateRange.replace('d', ''));
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    return startDate;
  }

  /**
   * Get number of days in range
   */
  getDaysInRange(dateRange) {
    if (dateRange === 'all') {
      return 365; // Default for all time
    }
    return parseInt(dateRange.replace('d', ''));
  }
}

module.exports = new AnalyticsService();