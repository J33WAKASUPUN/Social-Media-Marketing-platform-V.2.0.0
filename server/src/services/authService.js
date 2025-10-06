const User = require("../models/User");
const { generateTokenPair } = require("../utils/jwt");
const crypto = require("crypto");
const emailService = require("./emailService");

class AuthService {
  /**
   * Register New User
   */
  async register(email, password, name) {
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.name
    );

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.name);

    const tokens = await generateTokenPair(user._id);

    return { user, tokens };
  }

  /**
   * Verify Email
   */
  async verifyEmail(token) {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error("Invalid or expired verification token");
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return { success: true, user };
  }

  /**
   * Resend Verification Email
   */
  async resendVerificationEmail(email) {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.emailVerified) {
      throw new Error("Email already verified");
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.name
    );

    return { success: true };
  }

  /**
   * Request Password Reset
   */
  async requestPasswordReset(email) {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return { success: true };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    // Send reset email (UPDATED)
    await emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.name
    );

    return { success: true };
  }

  /**
   * Login User
   */
  async login(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new Error(
        "Account temporarily locked due to multiple failed login attempts"
      );
    }

    // Check if account is suspended
    if (user.status === "suspended") {
      throw new Error("Account has been suspended");
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      throw new Error("Invalid credentials");
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.updateOne({
        $set: { loginAttempts: 0, lastLogin: new Date() },
        $unset: { lockUntil: 1 },
      });
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate tokens
    const tokens = await generateTokenPair(user._id);

    return { user, tokens };
  }

  /**
   * Google OAuth Login/Register
   */
  async googleAuth(profile) {
    const { id: googleId, emails, displayName, photos } = profile;
    const email = emails[0].value;
    const googleAvatar = photos && photos[0] ? photos[0].value : null;

    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with this email
      user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.googleEmail = email;
        user.googleAvatar = googleAvatar;
        user.emailVerified = true;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          email: email.toLowerCase(),
          name: displayName,
          googleId,
          googleEmail: email,
          googleAvatar,
          emailVerified: true,
          status: "active",
        });
      }
    } else {
      // Update last login
      user.lastLogin = new Date();
      user.googleAvatar = googleAvatar; // Update avatar if changed
      await user.save();
    }

    // Generate tokens
    const tokens = await generateTokenPair(user._id);

    return { user, tokens };
  }

  /**
   * Request Password Reset
   */
  async requestPasswordReset(email) {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if email exists
      return { success: true };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    return { success: true };
  }

  /**
   * Reset Password
   */
  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { success: true };
  }

  /**
   * Update Profile
   */
  async updateProfile(userId, data) {
    const allowedUpdates = ["name", "timezone"];
    const updates = {};

    Object.keys(data).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = data[key];
      }
    });

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Upload Avatar
   */
  async uploadAvatar(userId, filename) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // TODO: Delete old avatar file if exists

    user.avatar = filename;
    await user.save();

    return user;
  }
}

module.exports = new AuthService();
