const channelService = require("../services/channelService");
const ProviderFactory = require("../providers/ProviderFactory");
const Channel = require("../models/Channel");
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

      const channel = await Channel.findById(req.params.id);
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

      const result = await provider.publish({
        content,
        mediaUrls,
        title,
      });

      res.json({
        success: true,
        message: "Post published successfully",
        data: result,
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

      const result = await provider.updatePost(platformPostId, content);

      res.json({
        success: true,
        message: "Post updated successfully",
        data: result,
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

      const result = await provider.deletePost(platformPostId);

      res.json({
        success: true,
        message: "Post deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get published posts
  async getPosts(req, res, next) {
    try {
      const { count, start } = req.query;

      const channel = await Channel.findById(req.params.id);
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Channel not found",
        });
      }

      const provider = ProviderFactory.getProvider(channel.provider, channel);

      // Check if provider supports getPosts
      if (typeof provider.getPosts !== "function") {
        return res.status(501).json({
          success: false,
          message: `${channel.provider} does not support retrieving posts`,
        });
      }

      const posts = await provider.getPosts({
        count: parseInt(count) || 50,
        start: parseInt(start) || 0,
        // Removed sortBy - LinkedIn doesn't support it
      });

      res.json({
        success: true,
        message: "Posts retrieved successfully",
        data: {
          posts,
          count: posts.length,
          provider: channel.provider,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChannelController();
