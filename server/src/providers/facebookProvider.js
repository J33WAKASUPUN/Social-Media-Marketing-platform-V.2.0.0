const axios = require('axios');
const BaseProvider = require('../providers/baseProvider');

class FacebookProvider extends BaseProvider {
  getConfig() {
    return {
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
      callbackUrl: process.env.FACEBOOK_CALLBACK_URL,
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      apiUrl: 'https://graph.facebook.com/v18.0',
      scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
    };
  }

  getAuthorizationUrl(state) {
    const config = this.getConfig();
    const params = new URLSearchParams({
      client_id: config.appId,
      redirect_uri: config.callbackUrl,
      state: state,
      scope: config.scopes.join(','),
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  async handleCallback(code) {
    const config = this.getConfig();

    try {
      // Exchange code for access token
      const tokenResponse = await axios.get(config.tokenUrl, {
        params: {
          client_id: config.appId,
          client_secret: config.appSecret,
          redirect_uri: config.callbackUrl,
          code: code,
        },
      });

      const { access_token } = tokenResponse.data;

      // Exchange short-lived token for long-lived token
      const longLivedTokenResponse = await axios.get(`${config.apiUrl}/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: config.appId,
          client_secret: config.appSecret,
          fb_exchange_token: access_token,
        },
      });

      const longLivedToken = longLivedTokenResponse.data.access_token;

      // Get user's pages
      const pagesResponse = await axios.get(`${config.apiUrl}/me/accounts`, {
        params: {
          access_token: longLivedToken,
        },
      });

      const pages = pagesResponse.data.data;

      if (!pages || pages.length === 0) {
        throw new Error('No Facebook Pages found. Please create a Page first.');
      }

      // Use first page (you can let user select later)
      const page = pages[0];

      return {
        accessToken: page.access_token, // Use page token, not user token
        refreshToken: null,
        expiresIn: null, // Page tokens don't expire
        platformUserId: page.id,
        displayName: page.name,
        profileUrl: `https://facebook.com/${page.id}`,
        avatar: `https://graph.facebook.com/${page.id}/picture?type=large`,
        providerData: {
          category: page.category,
          tasks: page.tasks,
        },
      };
    } catch (error) {
      this.logError('OAuth callback', error);
      throw new Error(`Facebook OAuth failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async refreshAccessToken() {
    // Facebook Page tokens don't expire
    // But we can exchange for a new long-lived token if needed
    throw new Error('Facebook Page tokens do not need refresh');
  }

  async testConnection() {
    try {
      const accessToken = this.getAccessToken();
      const config = this.getConfig();

      const response = await axios.get(`${config.apiUrl}/${this.channel.platformUserId}`, {
        params: {
          fields: 'id,name',
          access_token: accessToken,
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

      const payload = {
        message: post.content,
        access_token: accessToken,
      };

      // Add photos if present
      if (post.mediaUrls && post.mediaUrls.length > 0) {
        // For single image
        if (post.mediaUrls.length === 1) {
          payload.url = post.mediaUrls[0];
        }
        // For multiple images, use different endpoint
        // For now, we'll just use first image
        else {
          payload.url = post.mediaUrls[0];
        }
      }

      const response = await axios.post(
        `${config.apiUrl}/${this.channel.platformUserId}/feed`,
        payload
      );

      return {
        success: true,
        platformPostId: response.data.id,
        platformUrl: `https://facebook.com/${response.data.id}`,
      };
    } catch (error) {
      this.logError('Publish failed', error);
      throw new Error(`Facebook publish failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async getPostAnalytics(platformPostId) {
    try {
      const accessToken = this.getAccessToken();
      const config = this.getConfig();

      // ⚠️ Facebook API Limitation:
      // Analytics require additional permissions and Page Insights API
      // For basic metrics:
      const response = await axios.get(`${config.apiUrl}/${platformPostId}`, {
        params: {
          fields: 'likes.summary(true),comments.summary(true),shares',
          access_token: accessToken,
        },
      });

      const data = response.data;

      return {
        likes: data.likes?.summary?.total_count || 0,
        comments: data.comments?.summary?.total_count || 0,
        shares: data.shares?.count || 0,
        // Reach and impressions require Page Insights API
        reach: null,
        impressions: null,
      };
    } catch (error) {
      this.logError('Get analytics failed', error);
      return null;
    }
  }
}

module.exports = FacebookProvider;