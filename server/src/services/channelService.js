const Channel = require('../models/Channel');
const Brand = require('../models/Brand');
const Membership = require('../models/Membership');
const encryptionService = require('./encryptionService');
const oauthService = require('./oauthService');
const ProviderFactory = require('../providers/ProviderFactory');
const logger = require('../utils/logger');

class ChannelService {
  /**
   * Get authorization URL for connecting a channel
   */
  async getAuthorizationUrl(provider, brandId, userId, returnUrl = null) {
    // Check if brand exists and user has access
    const brand = await Brand.findById(brandId);
    if (!brand) {
      throw new Error('Brand not found');
    }

    const membership = await Membership.findOne({
      user: userId,
      brand: brandId,
    });

    if (!membership || !membership.hasPermission('connect_channels')) {
      throw new Error('Permission denied');
    }

    // Generate OAuth URL
    const { authUrl, state } = await oauthService.getAuthorizationUrl(
      provider,
      brandId,
      userId,
      returnUrl
    );

    return { authUrl, state };
  }

  /**
   * Handle OAuth callback and create channel
   */
  async handleCallback(provider, code, state) {
    // Validate OAuth state and exchange code for tokens
    const { accountData, stateData } = await oauthService.handleCallback(
      provider,
      code,
      state
    );

    // Check if channel already exists
    const existingChannel = await Channel.findOne({
      brand: stateData.brandId,
      provider: provider,
      platformUserId: accountData.platformUserId,
    });

    if (existingChannel) {
      // Update existing channel
      const encryptedTokens = encryptionService.encryptTokens({
        accessToken: accountData.accessToken,
        refreshToken: accountData.refreshToken,
      });

      existingChannel.accessToken = encryptedTokens.accessToken;
      existingChannel.refreshToken = encryptedTokens.refreshToken;
      existingChannel.tokenExpiresAt = accountData.expiresIn
        ? new Date(Date.now() + accountData.expiresIn * 1000)
        : null;
      existingChannel.displayName = accountData.displayName;
      existingChannel.avatar = accountData.avatar;
      existingChannel.profileUrl = accountData.profileUrl;
      existingChannel.connectionStatus = 'active';
      existingChannel.providerData = accountData.providerData || {};

      await existingChannel.save();

      logger.info(`Channel reconnected: ${provider} for brand ${stateData.brandId}`);

      return {
        channel: existingChannel,
        isNew: false,
        returnUrl: stateData.returnUrl,
      };
    }

    // Create new channel
    const encryptedTokens = encryptionService.encryptTokens({
      accessToken: accountData.accessToken,
      refreshToken: accountData.refreshToken,
    });

    const channel = await Channel.create({
      brand: stateData.brandId,
      provider: provider,
      platformUserId: accountData.platformUserId,
      platformUsername: accountData.platformUsername,
      displayName: accountData.displayName,
      avatar: accountData.avatar,
      profileUrl: accountData.profileUrl,
      accessToken: encryptedTokens.accessToken,
      refreshToken: encryptedTokens.refreshToken,
      tokenExpiresAt: accountData.expiresIn
        ? new Date(Date.now() + accountData.expiresIn * 1000)
        : null,
      scopes: accountData.scopes || [],
      providerData: accountData.providerData || {},
      connectedBy: stateData.userId,
    });

    logger.info(`New channel connected: ${provider} for brand ${stateData.brandId}`);

    return {
      channel,
      isNew: true,
      returnUrl: stateData.returnUrl,
    };
  }

  /**
   * Get all channels for a brand
   */
  async getBrandChannels(brandId, userId) {
    // Check user access
    const membership = await Membership.findOne({
      user: userId,
      brand: brandId,
    });

    if (!membership) {
      throw new Error('Access denied');
    }

    const channels = await Channel.find({
      brand: brandId,
      connectionStatus: { $ne: 'disconnected' },
    }).sort({ createdAt: -1 });

    // Remove encrypted tokens from response
    return channels.map(channel => ({
      id: channel._id,
      provider: channel.provider,
      platformUserId: channel.platformUserId,
      platformUsername: channel.platformUsername,
      displayName: channel.displayName,
      avatar: channel.avatar,
      profileUrl: channel.profileUrl,
      connectionStatus: channel.connectionStatus,
      lastHealthCheck: channel.lastHealthCheck,
      healthCheckError: channel.healthCheckError,
      tokenExpiresAt: channel.tokenExpiresAt,
      connectedAt: channel.connectedAt,
      providerData: channel.providerData,
    }));
  }

  /**
   * Test channel connection
   */
  async testConnection(channelId, userId) {
    const channel = await Channel.findById(channelId).populate('brand');

    if (!channel) {
      throw new Error('Channel not found');
    }

    // Check user access
    const membership = await Membership.findOne({
      user: userId,
      brand: channel.brand._id,
    });

    if (!membership) {
      throw new Error('Access denied');
    }

    // Test connection using provider
    const isValid = await channel.testConnection();

    return {
      channelId: channel._id,
      provider: channel.provider,
      isValid,
      lastHealthCheck: channel.lastHealthCheck,
      connectionStatus: channel.connectionStatus,
      error: channel.healthCheckError,
    };
  }

  /**
   * Disconnect channel
   */
  async disconnectChannel(channelId, userId) {
    const channel = await Channel.findById(channelId).populate('brand');

    if (!channel) {
      throw new Error('Channel not found');
    }

    // Check user access
    const membership = await Membership.findOne({
      user: userId,
      brand: channel.brand._id,
    });

    if (!membership || !membership.hasPermission('connect_channels')) {
      throw new Error('Permission denied');
    }

    channel.connectionStatus = 'disconnected';
    await channel.save();

    logger.info(`Channel disconnected: ${channel.provider} (ID: ${channelId})`);

    return { success: true };
  }

  /**
   * Refresh channel access token
   */
  async refreshToken(channelId, userId) {
    const channel = await Channel.findById(channelId).populate('brand');

    if (!channel) {
      throw new Error('Channel not found');
    }

    // Check user access
    const membership = await Membership.findOne({
      user: userId,
      brand: channel.brand._id,
    });

    if (!membership) {
      throw new Error('Access denied');
    }

    // Get provider instance
    const provider = ProviderFactory.getProvider(channel.provider, channel);

    try {
      // Attempt to refresh token
      const newTokens = await provider.refreshAccessToken();

      // Encrypt and update tokens
      const encryptedTokens = encryptionService.encryptTokens(newTokens);

      channel.accessToken = encryptedTokens.accessToken;
      if (newTokens.refreshToken) {
        channel.refreshToken = encryptedTokens.refreshToken;
      }
      if (newTokens.expiresIn) {
        channel.tokenExpiresAt = new Date(Date.now() + newTokens.expiresIn * 1000);
      }
      channel.connectionStatus = 'active';
      channel.healthCheckError = null;

      await channel.save();

      logger.info(`Token refreshed for channel: ${channel.provider} (ID: ${channelId})`);

      return { success: true, expiresAt: channel.tokenExpiresAt };
    } catch (error) {
      logger.error(`Token refresh failed for channel ${channelId}:`, error);
      throw error;
    }
  }
}

module.exports = new ChannelService();