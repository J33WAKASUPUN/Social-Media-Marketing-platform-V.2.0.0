const channelService = require("../services/channelService");
const ProviderFactory = require("../providers/ProviderFactory");
const Channel = require("../models/Channel");
const PublishedPost = require("../models/PublishedPost");
const mongoose = require("mongoose");
const path = require("path");

class ChannelController {
  async getAuthorizationUrl(req, res, next) {
    try {
      const { provider } = req.params;
      const { brandId, returnUrl } = req.query;

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: "Brand ID is required",
        });
      }

      const result = await channelService.getAuthorizationUrl(
        provider,
        brandId,
        req.user._id,
        returnUrl
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async handleCallback(req, res, next) {
    try {
      const { provider } = req.params;
      const { code, state, error, error_description } = req.query;

      if (error) {
        const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
        return res.redirect(
          `${frontendUrl}/channels?error=${encodeURIComponent(
            error_description || error
          )}`
        );
      }

      if (!code || !state) {
        return res.status(400).json({
          success: false,
          message: "Authorization code and state are required",
        });
      }

      const result = await channelService.handleCallback(provider, code, state);

      const redirectUrl = `${result.returnUrl}/channels?success=true&provider=${provider}&new=${result.isNew}`;
      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  async getBrandChannels(req, res, next) {
    try {
      const { brandId } = req.query;

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: "Brand ID is required",
        });
      }

      const channels = await channelService.getBrandChannels(
        brandId,
        req.user._id
      );

      res.json({
        success: true,
        data: channels,
      });
    } catch (error) {
      next(error);
    }
  }

  async testConnection(req, res, next) {
    try {
      const result = await channelService.testConnection(
        req.params.id,
        req.user._id
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async disconnectChannel(req, res, next) {
    try {
      await channelService.disconnectChannel(req.params.id, req.user._id);

      res.json({
        success: true,
        message: "Channel disconnected successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const result = await channelService.refreshToken(
        req.params.id,
        req.user._id
      );

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async testPublish(req, res, next) {
    try {
      const content = req.body.content;
      const title = req.body.title || "Test Post";

      if (!content) {
        return res.status(400).json({
          success: false,
          message: "Content is required",
        });
      }

      const channel = await Channel.findById(req.params.id).populate("brand");
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Channel not found",
        });
      }

      const provider = ProviderFactory.getProvider(channel.provider, channel);

      let mediaUrls = [];

      if (req.body.mediaUrls) {
        if (Array.isArray(req.body.mediaUrls)) {
          mediaUrls = req.body.mediaUrls;
        } else if (typeof req.body.mediaUrls === "string") {
          mediaUrls = req.body.mediaUrls.split(",").map((url) => url.trim());
        }
      }

      if (req.files && req.files.length > 0) {
        mediaUrls = req.files.map((file) => file.path);
      }

      // Publish to platform
      const result = await provider.publish({
        content,
        mediaUrls,
        title,
      });

      // SAVE TO DATABASE
      const publishedPost = await PublishedPost.create({
        brand: channel.brand._id,
        channel: channel._id,
        publishedBy: req.user._id,
        provider: channel.provider,
        platformPostId: result.platformPostId,
        platformUrl: result.platformUrl,
        title,
        content,
        mediaUrls,
        mediaType: result.mediaType || "none",
        status: "published",
        publishedAt: new Date(),
      });

      res.json({
        success: true,
        message: "Post published and saved successfully",
        data: {
          platform: result,
          database: {
            id: publishedPost._id,
            platformPostId: publishedPost.platformPostId,
            status: publishedPost.status,
            publishedAt: publishedPost.publishedAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async testUpdate(req, res, next) {
    try {
      const { platformPostId, content } = req.body;

      if (!platformPostId || !content) {
        return res.status(400).json({
          success: false,
          message: "platformPostId and content are required",
        });
      }

      const channel = await Channel.findById(req.params.id);
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Channel not found",
        });
      }

      const provider = ProviderFactory.getProvider(channel.provider, channel);

      // Update on platform
      const result = await provider.updatePost(platformPostId, content);

      // UPDATE IN DATABASE
      const publishedPost = await PublishedPost.findOneAndUpdate(
        {
          channel: channel._id,
          platformPostId: platformPostId,
        },
        {
          content: content,
          status: "updated",
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!publishedPost) {
        const existingPosts = await PublishedPost.find({
          channel: channel._id,
        }).select("platformPostId provider status");

        console.log("🔍 Existing posts in DB:", existingPosts);

        return res.status(404).json({
          success: false,
          message:
            "Post not found in database. It may not have been published through this platform.",
          debug: {
            searchedFor: {
              channel: channel._id,
              platformPostId: platformPostId,
            },
            existingPosts: existingPosts.map((p) => ({
              id: p._id,
              platformPostId: p.platformPostId,
              provider: p.provider,
            })),
          },
        });
      }

      res.json({
        success: true,
        message: "Post updated successfully",
        data: {
          platform: result,
          database: publishedPost,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async testDelete(req, res, next) {
    try {
      const { platformPostId } = req.body;

      if (!platformPostId) {
        return res.status(400).json({
          success: false,
          message: "platformPostId is required",
        });
      }

      const channel = await Channel.findById(req.params.id);
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Channel not found",
        });
      }

      const provider = ProviderFactory.getProvider(channel.provider, channel);

      // Delete from platform
      const result = await provider.deletePost(platformPostId);

      // SOFT DELETE IN DATABASE
      const publishedPost = await PublishedPost.findOneAndUpdate(
        {
          provider: channel.provider,
          platformPostId: platformPostId,
        },
        {
          status: "deleted",
          deletedAt: new Date(),
        },
        { new: true }
      );

      res.json({
        success: true,
        message: "Post deleted successfully",
        data: {
          platform: result,
          database: publishedPost,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get published posts
  async getPosts(req, res, next) {
    try {
      const {
        brandId,
        channelId,
        provider,
        status,
        limit = 50,
        skip = 0,
      } = req.query;

      console.log("📊 Get Posts Query:", {
        brandId,
        channelId,
        provider,
        status,
        limit,
        skip,
      });

      // Build query
      const query = {};

      if (brandId) {
        // ✅ FIX: Use 'new' with ObjectId
        query.brand = new mongoose.Types.ObjectId(brandId);
      }

      if (channelId) {
        // ✅ FIX: Use 'new' with ObjectId
        query.channel = new mongoose.Types.ObjectId(channelId);
      }

      if (provider) {
        query.provider = provider;
      }

      if (status) {
        query.status = status;
      } else {
        query.status = { $ne: "deleted" };
      }

      console.log("📝 MongoDB Query:", JSON.stringify(query, null, 2));

      const posts = await PublishedPost.find(query)
        .populate("channel", "provider displayName avatar")
        .populate("publishedBy", "name email avatar")
        .sort({ publishedAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const total = await PublishedPost.countDocuments(query);

      console.log(`✅ Found ${posts.length} posts (Total: ${total})`);

      res.json({
        success: true,
        message: "Posts retrieved successfully",
        data: {
          posts,
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: total > parseInt(skip) + parseInt(limit),
        },
      });
    } catch (error) {
      console.error("❌ Get Posts Error:", error);
      next(error);
    }
  }
}

module.exports = new ChannelController();