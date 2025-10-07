const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const { requireAuth } = require('../middlewares/auth');
const { uploadMedia } = require('../middlewares/upload');

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

router.get('/', channelController.getBrandChannels);
router.get('/:id/test', channelController.testConnection);
router.delete('/:id', channelController.disconnectChannel);
router.post('/:id/refresh', channelController.refreshToken);

// Upload middleware BEFORE testPublish
router.post('/:id/test-publish', uploadMedia, channelController.testPublish);
router.patch('/:id/test-update', channelController.testUpdate);
router.delete('/:id/test-delete', channelController.testDelete);
router.get('/:id/posts', channelController.getPosts);

module.exports = router;