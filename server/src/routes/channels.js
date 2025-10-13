const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const { requireAuth } = require('../middlewares/auth');
const { uploadMedia } = require('../middlewares/upload');
const { validateRequest, schemas } = require('../middlewares/validateRequest');

// OAuth Flow (requires authentication)
router.get(
  '/oauth/:provider',
  requireAuth,
  channelController.getAuthorizationUrl
);

// OAuth Callback (public - no auth middleware, state validation in service)
router.get(
  '/oauth/:provider/callback',
  channelController.handleCallback
);

// Channel Management (all require authentication)
router.use(requireAuth);

// STATIC ROUTES FIRST (before :id routes)
router.get('/posts', channelController.getPosts); // Get all posts from DB

// DYNAMIC ROUTES
router.get('/', channelController.getBrandChannels);
router.get('/:id/test', channelController.testConnection);

// TWO-TIER DELETE ROUTES
router.delete('/:id', channelController.disconnectChannel);              // Soft delete
router.delete('/:id/permanent', channelController.permanentlyDeleteChannel); // Permanent delete
router.get('/:id/delete-impact', channelController.getDeleteImpact);

router.post('/:id/refresh', channelController.refreshToken);
router.get('/disconnected', channelController.getDisconnectedChannels);

// Publishing endpoints
router.post('/:id/test-publish', uploadMedia, channelController.testPublish);
router.patch('/:id/test-update', channelController.testUpdate);
router.delete('/:id/test-delete', channelController.testDelete);

// DEBUG ROUTE (with improved error handling)
router.get('/debug/instagram-pages', requireAuth, async (req, res, next) => {
  try {
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'accessToken query parameter required',
        example: 'GET /api/v1/channels/debug/instagram-pages?accessToken=YOUR_TOKEN'
      });
    }

    // LOG the access token (first 20 chars only for security)
    console.log('🔑 Testing Access Token:', accessToken.substring(0, 20) + '...');

    const axios = require('axios');
    const apiUrl = 'https://graph.facebook.com/v21.0';

    try {
      // Test 1: Get user info
      console.log('📊 Test 1: Getting user info...');
      const userResponse = await axios.get(`${apiUrl}/me`, {
        params: {
          fields: 'id,name,email',
          access_token: accessToken
        }
      });
      console.log('✅ User info retrieved:', userResponse.data);

      // Test 2: Get user's pages
      console.log('📊 Test 2: Getting user pages...');
      const pagesResponse = await axios.get(`${apiUrl}/me/accounts`, {
        params: {
          fields: 'id,name,access_token,instagram_business_account,category,tasks',
          access_token: accessToken
        }
      });
      console.log('✅ Pages retrieved:', pagesResponse.data);

      // Test 3: Get permissions
      console.log('📊 Test 3: Getting permissions...');
      const permissionsResponse = await axios.get(`${apiUrl}/me/permissions`, {
        params: {
          access_token: accessToken
        }
      });
      console.log('✅ Permissions retrieved:', permissionsResponse.data);

      res.json({
        success: true,
        data: {
          user: userResponse.data,
          pages: pagesResponse.data,
          permissions: permissionsResponse.data,
          analysis: {
            hasPages: !!(pagesResponse.data.data && pagesResponse.data.data.length > 0),
            pageCount: pagesResponse.data.data?.length || 0,
            pagesWithInstagram: pagesResponse.data.data?.filter(p => p.instagram_business_account).length || 0,
            grantedPermissions: permissionsResponse.data.data?.filter(p => p.status === 'granted').map(p => p.permission) || []
          }
        }
      });
    } catch (apiError) {
      // DETAILED API ERROR LOGGING
      console.error('❌ Facebook API Error:', {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        error: apiError.response?.data?.error,
        message: apiError.message
      });

      return res.status(apiError.response?.status || 500).json({
        success: false,
        message: 'Facebook API Error',
        error: {
          code: apiError.response?.data?.error?.code,
          message: apiError.response?.data?.error?.message,
          type: apiError.response?.data?.error?.type,
          fbtrace_id: apiError.response?.data?.error?.fbtrace_id
        },
        hint: apiError.response?.status === 400 
          ? 'Access token is invalid or expired. Generate a new token from Facebook Graph API Explorer.'
          : 'Check Facebook API error details above.'
      });
    }
  } catch (error) {
    console.error('❌ Debug Endpoint Error:', error);
    next(error);
  }
});

router.post(
  '/:id/test-publish', 
  uploadMedia, 
  validateRequest(schemas.publishPost),
  channelController.testPublish
);

router.patch(
  '/:id/test-update',
  validateRequest(schemas.updatePost),
  channelController.testUpdate
);

module.exports = router;