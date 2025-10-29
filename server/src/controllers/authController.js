const authService = require("../services/authService");
const emailService = require("../services/emailService");
const {
  verifyToken,
  blacklistToken,
  generateTokenPair,
} = require("../utils/jwt");

class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;

      // Validation
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: "Email, password, and name are required",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        });
      }

      const { user, tokens } = await authService.register(
        email,
        password,
        name
      );

      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: {
          user,
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const { user, tokens } = await authService.login(email, password);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user,
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (token) {
        await blacklistToken(token);
      }

      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh-token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
      }

      const decoded = await verifyToken(refreshToken, true);
      const tokens = await generateTokenPair(decoded.userId);

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: { tokens },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  async getMe(req, res, next) {
    try {
      res.json({
        success: true,
        data: { user: req.user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/auth/profile
   */
  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user._id, req.body);

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/upload-avatar
   */
  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const user = await authService.uploadAvatar(
        req.user._id,
        req.file.filename
      );

      res.json({
        success: true,
        message: "Avatar uploaded successfully",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      await authService.requestPasswordReset(email);

      res.json({
        success: true,
        message: "If the email exists, a reset link has been sent",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message: "Token and new password are required",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        });
      }

      await authService.resetPassword(token, password);

      res.json({
        success: true,
        message: "Password reset successful",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/test-email (For testing email service)
   */
  async testEmail(req, res, next) {
    try {
      const email = req.query.email || req.user?.email;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email parameter required",
        });
      }

      const result = await emailService.sendTestEmail(email);

      res.json({
        success: result.success,
        message: result.success
          ? `Test email sent to ${email}`
          : "Failed to send test email",
        messageId: result.messageId,
      });
    } catch (error) {
      next(error);
    }
  }

   /**
   * GET /api/v1/auth/verify-email?token=xxx
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Verification token is required",
        });
      }

      const result = await authService.verifyEmail(token);

      res.json({
        success: true,
        message: "Email verified successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/resend-verification
   */
  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      await authService.resendVerificationEmail(email);

      res.json({
        success: true,
        message: "Verification email sent",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();