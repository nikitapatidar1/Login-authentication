const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Please provide a username'],
    trim: true,
    maxlength: [30, 'Username cannot exceed 30 characters'],
    minlength: [3, 'Username must be at least 3 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
  },
  email: { 
    type: String, 
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    index: true
  },
  password: { 
    type: String, 
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  passwordChangedAt: Date,
  salt: { type: String, select: false }, // Explicit salt storage
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lockUntil: {
    type: Date,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Password hashing middleware (Improved)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // Generate and store salt explicitly
    this.salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, this.salt);
    this.passwordChangedAt = Date.now() - 1000; // 1 second ago
    next();
  } catch (err) {
    next(err);
  }
});

// Password comparison method (Enhanced)
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Primary comparison
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    // Fallback comparison using stored salt
    if (!isMatch && this.salt) {
      const hash = await bcrypt.hash(candidatePassword, this.salt);
      return hash === this.password;
    }
    
    return isMatch;
  } catch (err) {
    console.error('Password comparison error:', err);
    return false;
  }
};

// Password reset token generator (Improved)
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  
  return resetToken;
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Account lock/unlock methods
userSchema.methods.incrementLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil > Date.now()) {
    throw new Error('Account is temporarily locked');
  }
  
  this.loginAttempts += 1;
  if (this.loginAttempts >= 5) {
    this.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes lock
  }
};

userSchema.methods.resetLoginAttempts = function() {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
};

// Remove sensitive data from output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.salt;
  delete user.__v;
  delete user.loginAttempts;
  delete user.lockUntil;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  return user;
};

// Indexes for better performance

userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ lockUntil: 1 });
const User = mongoose.models.User || mongoose.model('User', userSchema);






module.exports = User;