const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User'); 
const crypto = require('crypto');
const sendEmail = require('../utils/email');

// Utility function to clean input
const cleanInput = (str) => str ? str.toString().trim() : '';

// Enhanced login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // 3. Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ success: true, token });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed',
      error: error.message // Include actual error message
    });
  }
};

// Enhanced registration controller
exports.register = async (req, res, next) => {
  try {
    // 1. Clean and validate input
    const username = cleanInput(req.body.username);
    const email = cleanInput(req.body.email).toLowerCase();
    const password = cleanInput(req.body.password);

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // 2. Check for existing user
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // 3. Hash password with explicit salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user with salt
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      salt
    });

    // 5. Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );

    // 6. Prepare response
    const userData = user.toObject();
    delete userData.password;
    delete userData.salt;

    res.status(201).json({
      success: true,
      token,
      user: userData
    });

  } catch (err) {
    console.error('Registration error:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Forgot password controller
exports.forgotPassword = async (req, res, next) => {
  try {
    const email = cleanInput(req.body.email).toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message: `Please click the following link to reset your password: ${resetUrl}`
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });

  } catch (err) {
    console.error('Forgot password error:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Email could not be sent'
    });
  }
};

// Reset password controller
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await user.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    const password = cleanInput(req.body.password);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.salt = salt;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (err) {
    console.error('Reset password error:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};