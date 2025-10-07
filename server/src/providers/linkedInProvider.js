const axios = require('axios');
const BaseProvider = require('../providers/baseProvider');

class LinkedInProvider extends BaseProvider {
  getConfig() {
    return {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackUrl: process.env.LINKEDIN_CALLBACK_URL,
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      apiUrl: 'https://api.linkedin.com/v2',
      // Use OAuth 2.0 scopes
      scopes: ['openid', 'profile', 'email', 'w_member_social'],
    };
  }

  getAuthorizationUrl(state) {
    const config = this.getConfig();
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.callbackUrl,
      state: state,
      scope: config.scopes.join(' '), // Space-separated, not comma
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  async handleCallback(code) {
    const config = this.getConfig();

    try {
      // Exchange code for access token
      const tokenResponse = await axios.post(
        config.tokenUrl,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: config.callbackUrl,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, expires_in } = tokenResponse.data;

      // Use OpenID Connect userinfo endpoint
      const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      const profile = profileResponse.data;

      return {
        accessToken: access_token,
        refreshToken: null, // LinkedIn doesn't provide refresh tokens
        expiresIn: expires_in,
        platformUserId: profile.sub,
        displayName: profile.name,
        profileUrl: `https://www.linkedin.com/in/${profile.given_name || profile.sub}`,
        avatar: profile.picture,
      };
    } catch (error) {
      this.logError('OAuth callback', error);
      throw new Error(`LinkedIn OAuth failed: ${error.response?.data?.error_description || error.message}`);
    }
  }

  async refreshAccessToken() {
    // LinkedIn doesn't support refresh tokens
    throw new Error('LinkedIn does not support token refresh. Please reconnect your account.');
  }

  async testConnection() {
    try {
      const accessToken = this.getAccessToken();

      const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return response.status === 200;
    } catch (error) {
      this.logError('Connection test', error);
      return false;
    }
  }

  async publish(post) {
    try {
      const accessToken = this.getAccessToken();
      const config = this.getConfig();

      // ⚠️ LinkedIn API Limitations:
      // - Only supports text posts and image posts
      // - No video support
      // - Cannot update or delete posts
      // - Limited analytics

      const payload = {
        author: `urn:li:person:${this.channel.platformUserId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: post.content,
            },
            shareMediaCategory: post.mediaUrls && post.mediaUrls.length > 0 ? 'IMAGE' : 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      // Add images if present (LinkedIn supports multiple images)
      if (post.mediaUrls && post.mediaUrls.length > 0) {
        // Note: This requires uploading images first to LinkedIn
        // For now, we'll skip actual image upload
        this.log('publish', 'LinkedIn image upload not implemented yet');
      }

      const response = await axios.post(
        `${config.apiUrl}/ugcPosts`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      return {
        success: true,
        platformPostId: response.data.id,
        platformUrl: null, // LinkedIn doesn't return direct post URL
      };
    } catch (error) {
      this.logError('Publish failed', error);
      throw new Error(`LinkedIn publish failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPostAnalytics(platformPostId) {
    // ⚠️ LinkedIn API Limitation:
    // Analytics API requires additional permissions and is complex
    // For MVP, we'll return null
    this.log('getPostAnalytics', 'LinkedIn analytics not supported in MVP');
    return null;
  }
}

module.exports = LinkedInProvider;