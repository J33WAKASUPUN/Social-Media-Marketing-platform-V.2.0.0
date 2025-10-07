const Organization = require('../models/Organization');
const Brand = require('../models/Brand');
const Membership = require('../models/Membership');

class OrganizationService {
  /**
   * Create new organization
   */
  async createOrganization(userId, data) {
    const { name, settings } = data;

    // Check if organization name already exists
    const existing = await Organization.findOne({ name });
    if (existing) {
      throw new Error('Organization name already exists');
    }

    // Create organization
    const organization = await Organization.create({
      name,
      owner: userId,
      settings: settings || {},
    });

    // Create default brand for organization
    const defaultBrand = await Brand.create({
      name: `${name} - Main`,
      organization: organization._id,
    });

    // Add owner as member with owner role
    await Membership.create({
      user: userId,
      brand: defaultBrand._id,
      organization: organization._id,
      role: 'owner',
    });

    return { organization, defaultBrand };
  }

  /**
   * Get user's organizations
   */
  async getUserOrganizations(userId) {
    // Find all brands where user is a member
    const memberships = await Membership.find({ user: userId })
      .populate('organization')
      .populate('brand');

    // Group by organization
    const organizationsMap = new Map();

    memberships.forEach(membership => {
      const orgId = membership.organization._id.toString();
      
      if (!organizationsMap.has(orgId)) {
        organizationsMap.set(orgId, {
          ...membership.organization.toObject(),
          brands: [],
        });
      }

      organizationsMap.get(orgId).brands.push({
        ...membership.brand.toObject(),
        role: membership.role,
        permissions: membership.permissions,
      });
    });

    return Array.from(organizationsMap.values());
  }

  /**
   * Update organization
   */
  async updateOrganization(organizationId, userId, data) {
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      throw new Error('Organization not found');
    }

    // Check if user is owner
    if (organization.owner.toString() !== userId.toString()) {
      throw new Error('Only organization owner can update settings');
    }

    const allowedUpdates = ['name', 'settings'];
    Object.keys(data).forEach(key => {
      if (allowedUpdates.includes(key)) {
        organization[key] = data[key];
      }
    });

    await organization.save();
    return organization;
  }

  /**
   * Delete organization (soft delete)
   */
  async deleteOrganization(organizationId, userId) {
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      throw new Error('Organization not found');
    }

    // Check if user is owner
    if (organization.owner.toString() !== userId.toString()) {
      throw new Error('Only organization owner can delete organization');
    }

    // Soft delete all brands in organization
    await Brand.updateMany(
      { organization: organizationId },
      { $set: { status: 'deleted', deletedAt: new Date() } }
    );

    // Update organization status
    organization.status = 'deleted';
    await organization.save();

    return { success: true };
  }
}

module.exports = new OrganizationService();