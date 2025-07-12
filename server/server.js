// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auth_demo')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// User Model
const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
}));

// Login Route (Fixed)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'default_secret_123',
      { expiresIn: '1h' }
    );

    // 4. Send response
    res.json({ 
      success: true,
      token,
      user: { id: user._id, email: user.email }
    });

  } catch (error) {
    console.error('🔥 Login Route Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Start Server
const PORT = process.env.PORT || 50001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));