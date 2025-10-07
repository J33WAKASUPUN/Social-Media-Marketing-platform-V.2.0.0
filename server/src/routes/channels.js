const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const { requireAuth } = require('../middlewares/auth');
const { checkBrandAccess } = require('../middlewares/rbac');

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

module.exports = router;