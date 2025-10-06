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

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const { user, tokens } = req.user;
    
    // Redirect to frontend with tokens
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:8080';
    res.redirect(
      `${frontendUrl}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`
    );
  }
);

module.exports = router;