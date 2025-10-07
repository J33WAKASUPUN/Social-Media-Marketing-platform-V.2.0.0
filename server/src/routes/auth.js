const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/auth');
const { uploadAvatar } = require('../middlewares/upload');
const passport = require('../config/googleOauth');

// JWT Authentication
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', requireAuth, authController.logout);
router.post('/refresh-token', authController.refreshToken);

// Email Verification
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Password Reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Profile Management
router.get('/me', requireAuth, authController.getMe);
router.patch('/profile', requireAuth, authController.updateProfile);
router.post('/upload-avatar', requireAuth, uploadAvatar, authController.uploadAvatar);

// Google OAuth
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

// ✅ PRODUCTION CALLBACK (for frontend)
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const { user, tokens } = req.user;
    
    // Redirect to frontend with tokens
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(
      `${frontendUrl}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`
    );
  }
);

// ✅ TEST CALLBACK (for backend testing - JSON response)
router.get('/google/callback/test',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const { user, tokens } = req.user;
    
    // Return JSON for testing
    res.json({
      success: true,
      message: 'Google OAuth successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          googleId: user.googleId,
          googleEmail: user.googleEmail,
          googleAvatar: user.googleAvatar,
          emailVerified: user.emailVerified,
          status: user.status,
          timezone: user.timezone,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      },
    });
  }
);

// Email test (development only)
if (process.env.NODE_ENV === 'development') {
  router.get('/test-email', authController.testEmail);
}

module.exports = router;