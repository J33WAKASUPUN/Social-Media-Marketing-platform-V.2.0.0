const mediaService = require('../services/mediaService');
const logger = require('../utils/logger');

class MediaController {
  /**
   * POST /api/v1/media/upload
   * Upload media files
   */
  async uploadMedia(req, res, next) {
    try {
      const { brandId, folder, tags, altText, caption } = req.body;

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID is required',
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
        });
      }

      // Upload all files
      const uploadedMedia = [];

      for (const file of req.files) {
        const media = await mediaService.uploadMedia(
          file,
          req.user._id,
          brandId,
          {
            folder: folder || 'uncategorized',
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            altText: altText || '',
            caption: caption || '',
          }
        );

        uploadedMedia.push(media);
      }

      res.status(201).json({
        success: true,
        message: `${uploadedMedia.length} file(s) uploaded successfully`,
        data: uploadedMedia,
      });
    } catch (error) {
      logger.error('❌ Upload media failed', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/media
   * Get media library
   */
  async getMediaLibrary(req, res, next) {
    try {
      const { brandId } = req.query;

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID is required',
        });
      }

      const filters = {
        type: req.query.type,
        folder: req.query.folder,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
        search: req.query.search,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      };

      const result = await mediaService.getMediaLibrary(brandId, filters);

      res.json({
        success: true,
        data: result.media,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('❌ Get media library failed', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/media/:id
   * Get single media
   */
  async getMediaById(req, res, next) {
    try {
      const { brandId } = req.query;

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID is required',
        });
      }

      const media = await mediaService.getMediaById(req.params.id, brandId);

      res.json({
        success: true,
        data: media,
      });
    } catch (error) {
      logger.error('❌ Get media failed', { error: error.message });
      next(error);
    }
  }

  /**
   * PATCH /api/v1/media/:id
   * Update media metadata
   */
  async updateMedia(req, res, next) {
    try {
      const { brandId, folder, tags, altText, caption } = req.body;

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID is required',
        });
      }

      const updates = {};
      if (folder !== undefined) updates.folder = folder;
      if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
      if (altText !== undefined) updates.altText = altText;
      if (caption !== undefined) updates.caption = caption;

      const media = await mediaService.updateMedia(req.params.id, brandId, updates);

      res.json({
        success: true,
        message: 'Media updated successfully',
        data: media,
      });
    } catch (error) {
      logger.error('❌ Update media failed', { error: error.message });
      next(error);
    }
  }

  /**
   * DELETE /api/v1/media/:id
   * Delete media
   */
  async deleteMedia(req, res, next) {
    try {
      const { brandId } = req.query;

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID is required',
        });
      }

      await mediaService.deleteMedia(req.params.id, brandId);

      res.json({
        success: true,
        message: 'Media deleted successfully',
      });
    } catch (error) {
      logger.error('❌ Delete media failed', { error: error.message });
      next(error);
    }
  }

  /**
   * POST /api/v1/media/bulk-delete
   * Bulk delete media
   */
  async bulkDeleteMedia(req, res, next) {
    try {
      const { brandId, mediaIds } = req.body;

      if (!brandId || !mediaIds || !Array.isArray(mediaIds)) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID and media IDs array are required',
        });
      }

      const results = await mediaService.bulkDeleteMedia(mediaIds, brandId);

      res.json({
        success: true,
        message: `${results.deleted.length} media deleted, ${results.failed.length} failed`,
        data: results,
      });
    } catch (error) {
      logger.error('❌ Bulk delete failed', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/media/folders
   * Get all folders
   */
  async getFolders(req, res, next) {
    try {
      const { brandId } = req.query;

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID is required',
        });
      }

      const folders = await mediaService.getFolders(brandId);

      res.json({
        success: true,
        data: folders,
      });
    } catch (error) {
      logger.error('❌ Get folders failed', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/media/tags
   * Get popular tags
   */
  async getPopularTags(req, res, next) {
    try {
      const { brandId } = req.query;

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID is required',
        });
      }

      const tags = await mediaService.getPopularTags(brandId);

      res.json({
        success: true,
        data: tags,
      });
    } catch (error) {
      logger.error('❌ Get tags failed', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/media/stats
   * Get storage statistics
   */
  async getStorageStats(req, res, next) {
    try {
      const { brandId } = req.query;

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID is required',
        });
      }

      const stats = await mediaService.getStorageStats(brandId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('❌ Get stats failed', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/media/for-post
   * Get media formatted for post composer
   */
  async getMediaForPostComposer(req, res, next) {
    try {
      const { brandId, type } = req.query;
      
      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID is required',
        });
      }

      const filters = {
        type, // 'image', 'video', or undefined for all
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 50,
        status: 'active',
      };
      
      const result = await mediaService.getMediaLibrary(brandId, filters);
      
      // Format for post composer
      const formattedMedia = result.media.map(m => ({
        id: m._id,
        url: m.s3Url,
        type: m.type,
        thumbnail: m.metadata?.thumbnailUrl || m.s3Url,
        name: m.originalName,
        size: m.size,
        sizeFormatted: this.formatBytes(m.size),
        usageCount: m.usageCount,
        folder: m.folder,
        tags: m.tags,
        altText: m.altText,
        caption: m.caption,
        createdAt: m.createdAt,
      }));
      
      res.json({
        success: true,
        data: formattedMedia,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('❌ Get media for post composer failed', { error: error.message });
      next(error);
    }
  }

   /**
   * POST /api/v1/media/folders
   * Create new folder
   */
  async createFolder(req, res, next) {
    try {
      const { brandId, name, description, color } = req.body;

      if (!brandId || !name) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID and folder name are required',
        });
      }

      const folder = await mediaService.createFolder(brandId, req.user._id, {
        name,
        description,
        color,
      });

      res.status(201).json({
        success: true,
        message: 'Folder created successfully',
        data: folder,
      });
    } catch (error) {
      logger.error('❌ Create folder failed', { error: error.message });
      next(error);
    }
  }

  /**
   * PATCH /api/v1/media/folders/:folderName
   * Rename folder
   */
  async renameFolder(req, res, next) {
    try {
      const { brandId, newName } = req.body;
      const oldName = decodeURIComponent(req.params.folderName);

      if (!brandId || !newName) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID and new folder name are required',
        });
      }

      const result = await mediaService.renameFolder(brandId, oldName, newName);

      res.json({
        success: true,
        message: `Folder renamed successfully (${result.updated} files updated)`,
        data: result,
      });
    } catch (error) {
      logger.error('❌ Rename folder failed', { error: error.message });
      next(error);
    }
  }

  /**
   * DELETE /api/v1/media/folders/:folderName
   * Delete folder (moves media to uncategorized)
   */
  async deleteFolder(req, res, next) {
    try {
      const { brandId } = req.query;
      const folderName = decodeURIComponent(req.params.folderName);

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID is required',
        });
      }

      const result = await mediaService.deleteFolder(brandId, folderName);

      res.json({
        success: true,
        message: `Folder deleted (${result.moved} files moved to uncategorized)`,
        data: result,
      });
    } catch (error) {
      logger.error('❌ Delete folder failed', { error: error.message });
      next(error);
    }
  }

  /**
   * POST /api/v1/media/move-to-folder
   * Move media to folder
   */
  async moveToFolder(req, res, next) {
    try {
      const { brandId, mediaIds, targetFolder } = req.body;

      if (!brandId || !mediaIds || !targetFolder) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID, media IDs, and target folder are required',
        });
      }

      const result = await mediaService.moveToFolder(mediaIds, brandId, targetFolder);

      res.json({
        success: true,
        message: `${result.moved} file(s) moved to ${targetFolder}`,
        data: result,
      });
    } catch (error) {
      logger.error('❌ Move to folder failed', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/v1/media/folders-metadata
   * Get folders with metadata
   */
  async getFoldersMetadata(req, res, next) {
    try {
      const { brandId } = req.query;

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID is required',
        });
      }

      const folders = await mediaService.getFoldersWithMetadata(brandId);

      res.json({
        success: true,
        data: folders,
      });
    } catch (error) {
      logger.error('❌ Get folders metadata failed', { error: error.message });
      next(error);
    }
  }

  /**
   * Helper: Format bytes to human-readable
   */
  formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }
}

module.exports = new MediaController();