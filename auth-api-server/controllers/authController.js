// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const dataProvider = require('../data/dataProvider');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ user: { id: userId } }, config.jwtSecret, {
    expiresIn: config.jwtExpiration
  });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ user: { id: userId } }, config.refreshSecret, {
    expiresIn: config.refreshExpiration
  });
};

// Register a user
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await dataProvider.user.findByEmail(email);
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = await dataProvider.user.create({ name, email, password });
    
    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    
    // Return user and tokens
    res.json({
      token,
      refreshToken,
      user
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login a user
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Check if user exists
    const user = await dataProvider.user.findByEmail(email);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    
    // Return user and tokens (without password)
    const { password: pwd, ...userWithoutPassword } = user;
    
    res.json({
      token,
      refreshToken,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await dataProvider.user.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.refreshSecret);
    
    // Generate new token
    const newToken = generateToken(decoded.user.id);
    
    res.json({ token: newToken });
  } catch (err) {
    console.error('Refresh token error:', err.message);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  
  try {
    // Update user
    const updatedUser = await dataProvider.user.update(req.user.id, { name, email });
    
    res.json({ user: updatedUser });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    const user = await dataProvider.user.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    await dataProvider.user.changePassword(req.user.id, newPassword);
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await dataProvider.user.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // In a real application, you would send an email with a reset link
    // For this example, we'll just create a token
    const resetToken = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '1h' });
    
    res.json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    console.error('Password reset request error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  
  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Update password
    await dataProvider.user.changePassword(decoded.userId, password);
    
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Password reset error:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};