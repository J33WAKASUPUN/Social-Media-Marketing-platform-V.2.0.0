const Media = require("../models/Media");
const s3Service = require("./s3Service");
const sharp = require("sharp");
const logger = require("../utils/logger");
const path = require("path");
const mongoose = require("mongoose");

class MediaService {
  /**
   * Upload media file to S3 and save to database
   */
  async uploadMedia(file, userId, brandId, options = {}) {
    try {
      logger.info("📤 Uploading media to library", {
        originalName: file.originalname,
        size: file.size,
        brandId,
      });

      // Determine media type
      const type = this.getMediaType(file.mimetype);

      // Upload to S3
      const uploadResult = await s3Service.uploadFile(file.path, "media", {
        brandId: brandId.toString(),
        uploadedBy: userId.toString(),
        type,
      });

      // Extract metadata
      const metadata = await this.extractMetadata(file.path, type);

      // Create database record
      const media = await Media.create({
        brand: brandId,
        uploadedBy: userId,
        filename: uploadResult.fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: uploadResult.size,
        s3Key: uploadResult.key,
        s3Url: uploadResult.url,
        s3Bucket: uploadResult.bucket,
        type,
        metadata,
        folder: options.folder || "uncategorized",
        tags: options.tags || [],
        altText: options.altText || "",
        caption: options.caption || "",
      });

      logger.info("✅ Media uploaded successfully", {
        mediaId: media._id,
        s3Url: media.s3Url,
      });

      return media;
    } catch (error) {
      logger.error("❌ Media upload failed", {
        error: error.message,
        file: file.originalname,
      });
      throw error;
    }
  }

  /**
   * Get media library for a brand
   */
  async getMediaLibrary(brandId, filters = {}) {
    try {
      const {
        type,
        folder,
        tags,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 20,
      } = filters;

      // Build query
      const query = {
        brand: brandId,
        status: "active",
      };

      if (type) query.type = type;
      if (folder) query.folder = folder;
      if (tags && tags.length > 0) query.tags = { $in: tags };

      if (search) {
        query.$or = [
          { originalName: { $regex: search, $options: "i" } },
          { altText: { $regex: search, $options: "i" } },
          { caption: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
        ];
      }

      // Sort
      const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

      // Pagination
      const skip = (page - 1) * limit;

      // Execute query
      const [media, totalCount] = await Promise.all([
        Media.find(query)
          .populate("uploadedBy", "name email avatar")
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Media.countDocuments(query),
      ]);

      return {
        media,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
        },
      };
    } catch (error) {
      logger.error("❌ Get media library failed", {
        error: error.message,
        brandId,
      });
      throw error;
    }
  }

  /**
   * Get single media by ID
   */
  async getMediaById(mediaId, brandId) {
    try {
      const media = await Media.findOne({
        _id: mediaId,
        brand: brandId,
        status: { $ne: "deleted" },
      }).populate("uploadedBy", "name email avatar");

      if (!media) {
        throw new Error("Media not found");
      }

      return media;
    } catch (error) {
      logger.error("❌ Get media by ID failed", {
        error: error.message,
        mediaId,
      });
      throw error;
    }
  }

  /**
   * Update media metadata
   */
  async updateMedia(mediaId, brandId, updates) {
    try {
      const allowedUpdates = ["folder", "tags", "altText", "caption"];
      const filteredUpdates = {};

      Object.keys(updates).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      const media = await Media.findOneAndUpdate(
        { _id: mediaId, brand: brandId, status: { $ne: "deleted" } },
        { $set: filteredUpdates },
        { new: true, runValidators: true }
      );

      if (!media) {
        throw new Error("Media not found");
      }

      logger.info("✅ Media updated", { mediaId, updates: filteredUpdates });

      return media;
    } catch (error) {
      logger.error("❌ Update media failed", {
        error: error.message,
        mediaId,
      });
      throw error;
    }
  }

  /**
   * Delete media (soft delete)
   */
  async deleteMedia(mediaId, brandId) {
    try {
      const media = await Media.findOne({
        _id: mediaId,
        brand: brandId,
      });

      if (!media) {
        throw new Error("Media not found");
      }

      // Check if media is used in any posts
      if (media.usageCount > 0) {
        throw new Error(
          `Cannot delete media that is used in ${media.usageCount} post(s). Archive it instead.`
        );
      }

      // Soft delete
      await media.softDelete();

      // Optionally delete from S3 (uncomment if you want hard delete)
      // await s3Service.deleteFile(media.s3Key);

      logger.info("✅ Media deleted", { mediaId });

      return { success: true, message: "Media deleted successfully" };
    } catch (error) {
      logger.error("❌ Delete media failed", {
        error: error.message,
        mediaId,
      });
      throw error;
    }
  }

  /**
   * Bulk delete media
   */
  async bulkDeleteMedia(mediaIds, brandId) {
    try {
      const results = {
        deleted: [],
        failed: [],
      };

      for (const mediaId of mediaIds) {
        try {
          await this.deleteMedia(mediaId, brandId);
          results.deleted.push(mediaId);
        } catch (error) {
          results.failed.push({ mediaId, error: error.message });
        }
      }

      return results;
    } catch (error) {
      logger.error("❌ Bulk delete failed", { error: error.message });
      throw error;
    }
  }

  /**
   * Get folders for a brand
   */
  async getFolders(brandId) {
    try {
      const folders = await Media.distinct("folder", {
        brand: brandId,
        status: "active",
      });

      return folders.sort();
    } catch (error) {
      logger.error("❌ Get folders failed", { error: error.message });
      throw error;
    }
  }

  /**
   * Get popular tags for a brand
   */
  async getPopularTags(brandId, limit = 20) {
    try {
      // Ensure brandId is ObjectId and add proper matching
      const tags = await Media.aggregate([
        {
          $match: {
            brand: new mongoose.Types.ObjectId(brandId),
            status: "active",
            tags: { $exists: true, $ne: [] }, // Only include documents with tags
          },
        },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ]);

      return tags.map((t) => ({ tag: t._id, count: t.count }));
    } catch (error) {
      logger.error("❌ Get popular tags failed", {
        error: error.message,
        stack: error.stack,
        brandId,
      });
      throw error;
    }
  }

  /**
   * Format bytes to human-readable size
   */
  formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  /**
   * Get storage statistics (Enhanced)
   */
  async getStorageStats(brandId) {
    try {
      // FIXED AGGREGATION
      const stats = await Media.aggregate([
        {
          $match: {
            brand: new mongoose.Types.ObjectId(brandId),
            status: "active",
          },
        },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            totalSize: { $sum: "$size" },
          },
        },
      ]);

      // CALCULATE TOTAL SEPARATELY
      const totalStats = await Media.aggregate([
        {
          $match: {
            brand: new mongoose.Types.ObjectId(brandId),
            status: "active",
          },
        },
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            totalSize: { $sum: "$size" },
          },
        },
      ]);

      // FORMAT RESPONSE WITH HUMAN-READABLE SIZES
      const byType = stats.map((stat) => ({
        type: stat._id,
        count: stat.count,
        totalSize: stat.totalSize,
        totalSizeFormatted: this.formatBytes(stat.totalSize),
      }));

      const total = totalStats[0] || { totalCount: 0, totalSize: 0 };

      return {
        byType,
        total: {
          totalCount: total.totalCount,
          totalSize: total.totalSize,
          totalSizeFormatted: this.formatBytes(total.totalSize),
        },
      };
    } catch (error) {
      logger.error("❌ Get storage stats failed", {
        error: error.message,
        brandId,
      });
      throw error;
    }
  }

  /**
   * Extract metadata from media file
   */
  async extractMetadata(filePath, type) {
    try {
      if (type === "image") {
        const metadata = await sharp(filePath).metadata();

        return {
          width: metadata.width,
          height: metadata.height,
          aspectRatio: this.calculateAspectRatio(
            metadata.width,
            metadata.height
          ),
          format: metadata.format,
        };
      }

      // For videos, you'd use a library like fluent-ffmpeg
      // Simplified version here
      if (type === "video") {
        return {
          format: path.extname(filePath).substring(1),
        };
      }

      return {};
    } catch (error) {
      logger.warn("⚠️ Failed to extract metadata", {
        error: error.message,
        filePath,
      });
      return {};
    }
  }

  /**
   * Get media type from MIME type
   */
  getMediaType(mimeType) {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return "document";
  }

  /**
   * Calculate aspect ratio
   */
  calculateAspectRatio(width, height) {
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
  }
}

module.exports = new MediaService();
