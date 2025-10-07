const brandService = require('../services/brandService');

class BrandController {
  /**
   * POST /api/v1/brands
   */
  async createBrand(req, res, next) {
    try {
      const { name, organizationId, description, settings } = req.body;

      if (!name || !organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Name and organization ID are required',
        });
      }

      const brand = await brandService.createBrand(req.user._id, {
        name,
        organizationId,
        description,
        settings,
      });

      res.status(201).json({
        success: true,
        message: 'Brand created successfully',
        data: brand,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/brands
   */
  async getUserBrands(req, res, next) {
    try {
      const brands = await brandService.getUserBrands(req.user._id);

      res.json({
        success: true,
        data: brands,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/brands/:brandId
   */
  async getBrandById(req, res, next) {
    try {
      const brand = await brandService.getBrandById(req.params.brandId, req.user._id);

      res.json({
        success: true,
        data: brand,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/brands/:brandId
   */
  async updateBrand(req, res, next) {
    try {
      const brand = await brandService.updateBrand(
        req.params.brandId,
        req.user._id,
        req.body
      );

      res.json({
        success: true,
        message: 'Brand updated successfully',
        data: brand,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/brands/:brandId
   */
  async deleteBrand(req, res, next) {
    try {
      await brandService.deleteBrand(req.params.brandId, req.user._id);

      res.json({
        success: true,
        message: 'Brand deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/brands/:brandId/members
   */
  async getBrandMembers(req, res, next) {
    try {
      const members = await brandService.getBrandMembers(
        req.params.brandId,
        req.user._id
      );

      res.json({
        success: true,
        data: members,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/brands/:brandId/members
   */
  async inviteMember(req, res, next) {
    try {
      const { email, role } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      const membership = await brandService.inviteMember(
        req.params.brandId,
        req.user._id,
        { email, role }
      );

      res.status(201).json({
        success: true,
        message: 'Invitation sent successfully',
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/brands/:brandId/members/:memberId
   */
  async updateMemberRole(req, res, next) {
    try {
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Role is required',
        });
      }

      const membership = await brandService.updateMemberRole(
        req.params.brandId,
        req.user._id,
        req.params.memberId,
        role
      );

      res.json({
        success: true,
        message: 'Member role updated successfully',
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/brands/:brandId/members/:memberId
   */
  async removeMember(req, res, next) {
    try {
      await brandService.removeMember(
        req.params.brandId,
        req.user._id,
        req.params.memberId
      );

      res.json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BrandController();