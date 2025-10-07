const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  logo: {
    type: String, // URL or filename
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC',
    },
    defaultPostingTime: {
      hour: { type: Number, default: 9 },
      minute: { type: Number, default: 0 },
    },
    requireApproval: {
      type: Boolean,
      default: false,
    },
    allowedPlatforms: [{
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'],
    }],
  },
  branding: {
    primaryColor: { type: String, default: '#667eea' },
    secondaryColor: { type: String, default: '#764ba2' },
    accentColor: { type: String, default: '#f093fb' },
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
  },
  deletedAt: Date,
}, {
  timestamps: true,
});

// Compound index for organization + name uniqueness
brandSchema.index({ organization: 1, name: 1 }, { unique: true });

// Soft delete
brandSchema.methods.softDelete = function() {
  this.status = 'deleted';
  this.deletedAt = new Date();
  return this.save();
};

// Restore soft deleted brand
brandSchema.methods.restore = function() {
  this.status = 'active';
  this.deletedAt = undefined;
  return this.save();
};

// Get team members for this brand
brandSchema.methods.getMembers = async function() {
  const Membership = mongoose.model('Membership');
  return await Membership.find({ brand: this._id }).populate('user', 'name email avatar');
};

// Check if user has access to brand
brandSchema.methods.userHasAccess = async function(userId) {
  const Membership = mongoose.model('Membership');
  const membership = await Membership.findOne({
    user: userId,
    brand: this._id,
  });
  return !!membership;
};

module.exports = mongoose.model('Brand', brandSchema);