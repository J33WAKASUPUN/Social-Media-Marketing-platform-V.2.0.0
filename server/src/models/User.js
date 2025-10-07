const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() {
      // Password required only if not pending and not Google OAuth user
      return this.status !== 'pending' && !this.googleId;
    },
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Profile
  avatar: {
    type: String,
    default: null,
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  
  // Google OAuth
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  googleEmail: {
    type: String,
    sparse: true,
  },
  googleAvatar: {
    type: String,
  },
  
  // Account Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'active',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Email Verification
  verificationToken: String,
  verificationTokenExpires: Date,
  
  // Invitation Token
  invitationToken: String,
  invitationTokenExpires: Date,
  
  // Metadata
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  // Skip hashing if password is not set (pending user)
  if (!this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Return false if no password is set
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get avatar URL (prefer uploaded avatar, fallback to Google avatar)
userSchema.methods.getAvatarUrl = function() {
  if (this.avatar) {
    if (!this.avatar.startsWith('http')) {
      return `${process.env.APP_URL}/uploads/avatars/${this.avatar}`;
    }
    return this.avatar;
  }
  return this.googleAvatar || null;
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.verificationToken;
  delete user.verificationTokenExpires;
  delete user.invitationToken;
  delete user.invitationTokenExpires;
  delete user.loginAttempts;
  delete user.lockUntil;
  
  user.avatarUrl = this.getAvatarUrl();
  
  return user;
};

module.exports = mongoose.model('User', userSchema);