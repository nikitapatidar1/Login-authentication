const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

// सभी इनपुट को साफ करने के लिए यूटिलिटी फंक्शन
const cleanInput = (str) => (str ? str.toString().trim() : '');

// लॉगिन कंट्रोलर
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. यूजर ढूंढें (case-insensitive)
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${cleanInput(email)}$`, 'i') }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // 2. पासवर्ड मिलान जांचें
    const isMatch = await bcrypt.compare(cleanInput(password), user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // 3. JWT टोकन जनरेट करें
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );

    // 4. रिस्पॉन्स तैयार करें (संवेदनशील डेटा हटाकर)
    const userData = user.toObject();
    delete userData.password;
    delete userData.resetPasswordToken;
    delete userData.resetPasswordExpire;

    res.status(200).json({
      success: true,
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// रजिस्ट्रेशन कंट्रोलर
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. वैलिडेशन
    if (!cleanInput(username) || !cleanInput(email) || !cleanInput(password)) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // 2. डुप्लीकेट यूजर चेक
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${cleanInput(email)}$`, 'i') }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // 3. पासवर्ड हैश करें
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanInput(password), salt);

    // 4. नया यूजर बनाएं
    const user = await User.create({
      username: cleanInput(username),
      email: cleanInput(email).toLowerCase(),
      password: hashedPassword,
      salt
    });

    // 5. टोकन जनरेट करें
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );

    // 6. रिस्पॉन्स भेजें
    const userData = user.toObject();
    delete userData.password;
    delete userData.salt;

    res.status(201).json({
      success: true,
      token,
      user: userData
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// पासवर्ड रीसेट कंट्रोलर
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. यूजर ढूंढें
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${cleanInput(email)}$`, 'i') }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 2. रीसेट टोकन जनरेट करें
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000; // 1 घंटा

    await user.save();

    // 3. ईमेल भेजें
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message: `Please click to reset your password: ${resetUrl}`
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Email could not be sent'
    });
  }
};

// पासवर्ड रीसेट कंफर्मेशन
exports.resetPassword = async (req, res) => {
  try {
    // 1. टोकन वेरिफाई करें
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // 2. नया पासवर्ड सेट करें
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(cleanInput(req.body.password), salt);
    user.salt = salt;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // 3. रिस्पॉन्स भेजें
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};