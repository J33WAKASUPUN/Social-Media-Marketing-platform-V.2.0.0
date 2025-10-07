const axios = require('axios');
const FormData = require('form-data');
const BaseProvider = require('../providers/baseProvider');

class LinkedInProvider extends BaseProvider {
  getConfig() {
    return {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackUrl: process.env.LINKEDIN_CALLBACK_URL,
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      apiUrl: 'https://api.linkedin.com/rest',
      // ✅ UPDATED: Use latest API version
      apiVersion: '202410', // Updated to October 2024 version
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
      scope: config.scopes.join(' '),
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

      // Get user profile
      const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      const profile = profileResponse.data;

      return {
        accessToken: access_token,
        refreshToken: null,
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

  // ✅ UPDATED: Upload image with correct API version
  async uploadImage(imageUrl) {
    try {
      const accessToken = this.getAccessToken();
      const config = this.getConfig();

      // Step 1: Initialize image upload
      const initResponse = await axios.post(
        `${config.apiUrl}/images?action=initializeUpload`,
        {
          initializeUploadRequest: {
            owner: `urn:li:person:${this.channel.platformUserId}`,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'LinkedIn-Version': config.apiVersion, // ✅ Use config version
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      const uploadUrl = initResponse.data.value.uploadUrl;
      const imageUrn = initResponse.data.value.image;

      // Step 2: Download image from URL
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data);

      // Step 3: Upload image to LinkedIn's CDN
      await axios.put(uploadUrl, imageBuffer, {
        headers: {
          'Content-Type': imageResponse.headers['content-type'],
        },
      });

      this.log('Image uploaded', { imageUrn });
      return imageUrn;
    } catch (error) {
      this.logError('Image upload failed', error);
      throw new Error(`LinkedIn image upload failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // ✅ UPDATED: Upload video with correct API version
  async uploadVideo(videoUrl) {
    try {
      const accessToken = this.getAccessToken();
      const config = this.getConfig();

      // Step 1: Initialize video upload
      const initResponse = await axios.post(
        `${config.apiUrl}/videos?action=initializeUpload`,
        {
          initializeUploadRequest: {
            owner: `urn:li:person:${this.channel.platformUserId}`,
            fileSizeBytes: 0,
            uploadCaptions: false,
            uploadThumbnail: false,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'LinkedIn-Version': config.apiVersion, // ✅ Use config version
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      const uploadUrl = initResponse.data.value.uploadUrl;
      const videoUrn = initResponse.data.value.video;
      const uploadToken = initResponse.data.value.uploadToken;

      // Step 2: Download video from URL
      const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
      const videoBuffer = Buffer.from(videoResponse.data);

      // Step 3: Upload video to LinkedIn's CDN
      await axios.put(uploadUrl, videoBuffer, {
        headers: {
          'Content-Type': videoResponse.headers['content-type'] || 'video/mp4',
        },
      });

      // Step 4: Finalize upload
      await axios.post(
        `${config.apiUrl}/videos?action=finalizeUpload`,
        {
          finalizeUploadRequest: {
            video: videoUrn,
            uploadToken: uploadToken,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'LinkedIn-Version': config.apiVersion, // ✅ Use config version
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      this.log('Video uploaded and finalized', { videoUrn });
      return videoUrn;
    } catch (error) {
      this.logError('Video upload failed', error);
      throw new Error(`LinkedIn video upload failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // ✅ UPDATED: Publish post with correct API version
  async publish(post) {
    try {
      const accessToken = this.getAccessToken();
      const config = this.getConfig();

      // Build post payload
      const payload = {
        author: `urn:li:person:${this.channel.platformUserId}`,
        commentary: post.content,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
      };

      // Upload and attach media if present
      if (post.mediaUrls && post.mediaUrls.length > 0) {
        const mediaUrns = [];

        for (const mediaUrl of post.mediaUrls) {
          // Detect if image or video based on extension
          const isVideo = /\.(mp4|mov|avi|wmv)$/i.test(mediaUrl);

          if (isVideo) {
            const videoUrn = await this.uploadVideo(mediaUrl);
            mediaUrns.push({ media: videoUrn });
          } else {
            const imageUrn = await this.uploadImage(mediaUrl);
            mediaUrns.push({ media: imageUrn });
          }
        }

        // Add media to post
        if (mediaUrns.length > 0) {
          payload.content = {
            media: {
              title: post.title || 'Social Media Post',
              id: mediaUrns[0].media,
            },
          };
        }
      }

      // Create post
      const response = await axios.post(
        `${config.apiUrl}/posts`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'LinkedIn-Version': config.apiVersion, // ✅ Use config version
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      const postId = response.headers['x-restli-id'];
      const postUrn = `urn:li:share:${postId}`;

      this.log('Post published', { postUrn });

      return {
        success: true,
        platformPostId: postUrn,
        platformUrl: null,
      };
    } catch (error) {
      this.logError('Publish failed', error);
      throw new Error(`LinkedIn publish failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // ✅ UPDATED: Update post with correct API version
  async updatePost(platformPostId, newContent) {
    try {
      const accessToken = this.getAccessToken();
      const config = this.getConfig();

      const payload = {
        patch: {
          $set: {
            commentary: newContent,
          },
        },
      };

      await axios.post(
        `${config.apiUrl}/posts/${encodeURIComponent(platformPostId)}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'LinkedIn-Version': config.apiVersion, // ✅ Use config version
            'X-Restli-Protocol-Version': '2.0.0',
            'X-RestLi-Method': 'PARTIAL_UPDATE',
          },
        }
      );

      this.log('Post updated', { platformPostId });

      return {
        success: true,
        platformPostId,
      };
    } catch (error) {
      this.logError('Update failed', error);
      throw new Error(`LinkedIn update failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // ✅ UPDATED: Delete post with correct API version
  async deletePost(platformPostId) {
    try {
      const accessToken = this.getAccessToken();
      const config = this.getConfig();

      await axios.delete(
        `${config.apiUrl}/posts/${encodeURIComponent(platformPostId)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'LinkedIn-Version': config.apiVersion, // ✅ Use config version
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      this.log('Post deleted', { platformPostId });

      return {
        success: true,
      };
    } catch (error) {
      this.logError('Delete failed', error);
      throw new Error(`LinkedIn delete failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async getPostAnalytics(platformPostId) {
    this.log('getPostAnalytics', 'LinkedIn analytics require Organization access (not available for personal profiles)');
    return null;
  }
}

module.exports = LinkedInProvider;