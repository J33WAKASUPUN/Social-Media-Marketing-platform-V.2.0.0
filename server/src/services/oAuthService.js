const crypto = require('crypto');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');

class OAuthService {
  /**
   * Generate OAuth state parameter
   * Store in Redis with metadata
   */
  async generateState(brandId, userId, provider, returnUrl = null) {
    const state = crypto.randomBytes(32).toString('hex');
    const cacheClient = redisClient.getCache();
    
    const stateData = {
      brandId,
      userId,
      provider,
      returnUrl: returnUrl || process.env.CLIENT_URL,
      createdAt: Date.now(),
    };
    
    // Store state in Redis with 10-minute expiration
    await cacheClient.setEx(
      `oauth:state:${state}`,
      600, // 10 minutes
      JSON.stringify(stateData)
    );
    
    logger.info(`OAuth state generated for ${provider}`, { brandId, userId });
    
    return state;
  }

  /**
   * Validate OAuth state parameter
   * Retrieve and delete from Redis
   */
  async validateState(state) {
    const cacheClient = redisClient.getCache();
    
    try {
      const stateDataJson = await cacheClient.get(`oauth:state:${state}`);
      
      if (!stateDataJson) {
        throw new Error('Invalid or expired OAuth state');
      }
      
      // Delete state to prevent replay attacks
      await cacheClient.del(`oauth:state:${state}`);
      
      const stateData = JSON.parse(stateDataJson);
      
      // Check if state is expired (additional check)
      const age = Date.now() - stateData.createdAt;
      if (age > 600000) { // 10 minutes
        throw new Error('OAuth state expired');
      }
      
      logger.info(`OAuth state validated for ${stateData.provider}`, stateData);
      
      return stateData;
    } catch (error) {
      logger.error('OAuth state validation failed:', error);
      throw error;
    }
  }

  /**
   * Generate authorization URL for provider
   */
  async getAuthorizationUrl(provider, brandId, userId, returnUrl = null) {
    const ProviderFactory = require('../providers/ProviderFactory');
    
    if (!ProviderFactory.isProviderSupported(provider)) {
      throw new Error(`Provider '${provider}' is not supported`);
    }
    
    const providerInstance = ProviderFactory.getProvider(provider);
    const state = await this.generateState(brandId, userId, provider, returnUrl);
    const authUrl = providerInstance.getAuthorizationUrl(state);
    
    return { authUrl, state };
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(provider, code, state) {
    // Validate state
    const stateData = await this.validateState(state);
    
    if (stateData.provider !== provider) {
      throw new Error('Provider mismatch in OAuth state');
    }
    
    // Get provider instance
    const ProviderFactory = require('../providers/ProviderFactory');
    const providerInstance = ProviderFactory.getProvider(provider);
    
    // Exchange code for tokens and get user info
    const accountData = await providerInstance.handleCallback(code, state);
    
    return {
      accountData,
      stateData,
    };
  }
}

module.exports = new OAuthService();