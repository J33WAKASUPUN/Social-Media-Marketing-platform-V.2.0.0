const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: Brand management
 */

/**
 * @swagger
 * /api/v1/brands:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brands]
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
 *               - organizationId
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Brand
 *               organizationId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               description:
 *                 type: string
 *                 example: Brand description
 *     responses:
 *       201:
 *         description: Brand created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', brandController.createBrand);

/**
 * @swagger
 * /api/v1/brands:
 *   get:
 *     summary: Get all user brands
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of brands
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Brand'
 */
router.get('/', brandController.getUserBrands);

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   get:
 *     summary: Get brand by ID
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand details
 *       404:
 *         description: Brand not found
 */
router.get('/:id', brandController.getBrandById);

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   patch:
 *     summary: Update brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Brand updated
 *       404:
 *         description: Brand not found
 */
router.patch('/:id', brandController.updateBrand);

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   delete:
 *     summary: Delete brand
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand deleted
 *       404:
 *         description: Brand not found
 */
router.delete('/:id', brandController.deleteBrand);

// Team Management
router.post('/:id/invite', brandController.inviteMember);
router.get('/:id/members', brandController.getBrandMembers);
router.patch('/:id/members/:userId', brandController.updateMemberRole);
router.delete('/:id/members/:userId', brandController.removeMember);

module.exports = router;