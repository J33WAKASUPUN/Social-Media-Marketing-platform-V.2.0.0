const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { requireAuth } = require('../middlewares/auth');

// All organization routes require authentication
router.use(requireAuth);

router.post('/', organizationController.createOrganization);
router.get('/', organizationController.getUserOrganizations);
router.patch('/:id', organizationController.updateOrganization);
router.delete('/:id', organizationController.deleteOrganization);

module.exports = router;