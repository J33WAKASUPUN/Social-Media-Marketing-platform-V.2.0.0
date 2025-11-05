const organizationService = require('../services/organizationService');
const Membership = require('../models/Membership');
const User = require('../models/User');
const emailService = require('../services/emailService');
const crypto = require('crypto');

class OrganizationController {
  /**
   * POST /api/v1/organizations
   */
  async createOrganization(req, res, next) {
    try {
      const { name, description, settings } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Organization name is required',
        });
      }

      const result = await organizationService.createOrganization(
        req.user._id,
        { name, description, settings }
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

  // ========== NEW METHODS FOR MEMBERS MANAGEMENT ==========

  /**
   * GET /api/v1/organizations/:id/members
   */
  async getMembers(req, res, next) {
    try {
      const members = await Membership.find({ organization: req.params.id })
        .populate('user', 'name email avatar')
        .populate('brand', 'name')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: members,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
 * POST /api/v1/organizations/:id/members
 */
async inviteMember(req, res, next) {
  try {
    const { email, role } = req.body;
    const organizationId = req.params.id;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email and role are required',
      });
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create pending user with invitation
      const invitationToken = crypto.randomBytes(32).toString('hex');
      user = await User.create({
        email: email.toLowerCase(),
        name: email.split('@')[0],
        status: 'pending',
        invitationToken,
        invitationTokenExpires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Send invitation email
      await emailService.sendTeamInvitationEmail(
        email,
        req.user.name,
        organizationId,
        invitationToken
      );
    }

    // Check if already member of organization
    const existingMembership = await Membership.findOne({
      user: user._id,
      organization: organizationId,
      brand: { $exists: false },
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this organization',
      });
    }

    // Create organization-level membership WITHOUT brand
    const membership = await Membership.create({
      user: user._id,
      organization: organizationId,
      // NO brand field for organization-level memberships
      role,
      invitedBy: req.user._id,
      status: user.status === 'pending' ? 'pending' : 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Member invited successfully',
      data: membership,
    });
  } catch (error) {
    next(error);
  }
}

  /**
   * PUT /api/v1/organizations/:id/members/:userId
   */
  async updateMemberRole(req, res, next) {
    try {
      const { role } = req.body;
      const { id: organizationId, userId } = req.params;

      const membership = await Membership.findOneAndUpdate(
        { organization: organizationId, user: userId },
        { role },
        { new: true }
      ).populate('user', 'name email avatar');

      if (!membership) {
        return res.status(404).json({
          success: false,
          message: 'Member not found',
        });
      }

      res.json({
        success: true,
        message: 'Member role updated',
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/organizations/:id/members/:userId
   */
  async removeMember(req, res, next) {
    try {
      const { id: organizationId, userId } = req.params;

      await Membership.deleteMany({
        organization: organizationId,
        user: userId,
      });

      res.json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrganizationController();