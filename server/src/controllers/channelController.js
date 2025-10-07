const channelService = require('../services/channelService');

class ChannelController {
  /**
   * GET /api/v1/channels/oauth/:provider
   * Get OAuth authorization URL
   */
  async getAuthorizationUrl(req, res, next) {
    try {
      const { provider } = req.params;
      const { brandId, returnUrl } = req.query;

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID is required',
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

  /**
   * GET /api/v1/channels/oauth/:provider/callback
   * Handle OAuth callback
   */
  async handleCallback(req, res, next) {
    try {
      const { provider } = req.params;
      const { code, state, error, error_description } = req.query;

      // Handle OAuth errors
      if (error) {
        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        return res.redirect(
          `${frontendUrl}/channels?error=${encodeURIComponent(error_description || error)}`
        );
      }

      if (!code || !state) {
        return res.status(400).json({
          success: false,
          message: 'Authorization code and state are required',
        });
      }

      const result = await channelService.handleCallback(provider, code, state);

      // Redirect to frontend with success
      const redirectUrl = `${result.returnUrl}/channels?success=true&provider=${provider}&new=${result.isNew}`;
      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/channels
   * Get all channels for a brand
   */
  async getBrandChannels(req, res, next) {
    try {
      const { brandId } = req.query;

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: 'Brand ID is required',
        });
      }

      const channels = await channelService.getBrandChannels(brandId, req.user._id);

      res.json({
        success: true,
        data: channels,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/channels/:id/test
   * Test channel connection
   */
  async testConnection(req, res, next) {
    try {
      const result = await channelService.testConnection(req.params.id, req.user._id);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/channels/:id
   * Disconnect channel
   */
  async disconnectChannel(req, res, next) {
    try {
      await channelService.disconnectChannel(req.params.id, req.user._id);

      res.json({
        success: true,
        message: 'Channel disconnected successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/channels/:id/refresh
   * Refresh channel access token
   */
  async refreshToken(req, res, next) {
    try {
      const result = await channelService.refreshToken(req.params.id, req.user._id);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChannelController();