const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { requireAuth } = require('../middlewares/auth');
const { checkBrandAccess, requirePermission } = require('../middlewares/rbac');

// Invitation endpoints
router.get('/invitations/:token', brandController.getInvitationDetails);
router.post('/invitations/:token/accept', brandController.acceptInvitation);

// All other brand routes require authentication
router.use(requireAuth);

// Brand management
router.post('/', brandController.createBrand);
router.get('/', brandController.getUserBrands);
router.get('/:brandId', checkBrandAccess, brandController.getBrandById);
router.patch(
  '/:brandId',
  requirePermission('manage_brand'),
  brandController.updateBrand
);
router.delete(
  '/:brandId',
  requirePermission('delete_brand'),
  brandController.deleteBrand
);

// Team member management
router.get(
  '/:brandId/members',
  checkBrandAccess,
  brandController.getBrandMembers
);
router.post(
  '/:brandId/members',
  requirePermission('invite_members'),
  brandController.inviteMember
);
router.patch(
  '/:brandId/members/:memberId',
  requirePermission('manage_members'),
  brandController.updateMemberRole
);
router.delete(
  '/:brandId/members/:memberId',
  requirePermission('manage_members'),
  brandController.removeMember
);

module.exports = router;