const organizationService = require('../services/organizationService');

class OrganizationController {
  /**
   * POST /api/v1/organizations
   */
  async createOrganization(req, res, next) {
    try {
      const { name, settings } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Organization name is required',
        });
      }

      const result = await organizationService.createOrganization(
        req.user._id,
        { name, settings }
      );

      res.status(201).json({
        success: true,
        message: 'Organization created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/organizations
   */
  async getUserOrganizations(req, res, next) {
    try {
      const organizations = await organizationService.getUserOrganizations(req.user._id);

      res.json({
        success: true,
        data: organizations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/organizations/:id
   */
  async updateOrganization(req, res, next) {
    try {
      const organization = await organizationService.updateOrganization(
        req.params.id,
        req.user._id,
        req.body
      );

      res.json({
        success: true,
        message: 'Organization updated successfully',
        data: organization,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/organizations/:id
   */
  async deleteOrganization(req, res, next) {
    try {
      await organizationService.deleteOrganization(req.params.id, req.user._id);

      res.json({
        success: true,
        message: 'Organization deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrganizationController();