const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: Organization management
 */

/**
 * @swagger
 * /api/v1/organizations:
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Organization
 *     responses:
 *       201:
 *         description: Organization created
 *       401:
 *         description: Unauthorized
 */
router.post('/', organizationController.createOrganization);

/**
 * @swagger
 * /api/v1/organizations:
 *   get:
 *     summary: Get all user organizations
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of organizations
 */
router.get('/', organizationController.getUserOrganizations);

router.patch('/:id', organizationController.updateOrganization);
router.delete('/:id', organizationController.deleteOrganization);

module.exports = router;