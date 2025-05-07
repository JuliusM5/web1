const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user (protected route)
router.get('/me', auth, authController.getCurrentUser);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

// Update profile (protected route)
router.put('/profile', auth, authController.updateProfile);

// Change password (protected route)
router.post('/change-password', auth, authController.changePassword);

// Request password reset
router.post('/reset-password', authController.requestPasswordReset);

// Reset password with token
router.post('/reset-password/:token', authController.resetPassword);

// Logout - Client-side only for JWT, but we'll add an endpoint for consistency
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;