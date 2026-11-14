import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { logAudit } from '../utils/auditHelper.js';

const PARTNER_1 = {
  _id: 'user_partner_1',
  name: 'AJMALSHA',
  email: 'ajmalsha@cartseven.com',
  role: 'admin',
  location: 'Central Office',
  phone: '+91 98201 44891',
  password: 'password123',
  isActive: true,
};

const PARTNER_2 = {
  _id: 'user_partner_2',
  name: 'ASHIQUE SALIM',
  email: 'ashique@cartseven.com',
  role: 'accountant',
  location: 'Central Office',
  phone: '+91 98201 44892',
  password: 'password123',
  isActive: true,
};

const PARTNER_3 = {
  _id: 'user_partner_3',
  name: 'SHANU',
  email: 'shanu@cartseven.com',
  role: 'manager',
  location: 'Central Office',
  phone: '+91 98201 44893',
  password: 'password123',
  isActive: true,
};

const DEMO_USERS_MAP = {
  'ajmalsha@cartseven.com': PARTNER_1,
  'partner1@cartseven.com': PARTNER_1,
  'admin@cartseven.com': PARTNER_1,
  'ashique@cartseven.com': PARTNER_2,
  'ashiquesalim@cartseven.com': PARTNER_2,
  'partner2@cartseven.com': PARTNER_2,
  'accountant@cartseven.com': PARTNER_2,
  'shanu@cartseven.com': PARTNER_3,
  'partner3@cartseven.com': PARTNER_3,
  'manager@cartseven.com': PARTNER_3,
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'cartseven_jwt_secret_key_super_secure_987654321_ecommerce', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    let user = null;
    let isMatch = false;

    // Try MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ email }).select('+password');
        if (user) {
          isMatch = await user.matchPassword(password);
        }
      } catch (err) {
        console.warn('MongoDB query failed, falling back to in-memory accounts:', err.message);
      }
    }

    // Fallback in-memory authentication if DB offline or user not in DB
    if (!user) {
      const demoUser = DEMO_USERS_MAP[email.toLowerCase()];
      if (demoUser && (password === demoUser.password || password === 'password123')) {
        user = demoUser;
        isMatch = true;
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated. Contact admin.' });
    }

    const token = generateToken(user._id);

    try {
      await logAudit({
        req,
        user,
        action: 'LOGIN',
        entity: 'Auth',
        entityId: user._id,
        details: `User logged in from ${user.location || 'remote location'}`,
      });
    } catch {
      // Non-critical audit write failure
    }

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        phone: user.phone,
        avatar: user.avatar,
        lastLogin: new Date(),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        phone: user.phone,
        avatar: user.avatar,
        lastLogin: user.lastLogin || new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile & location
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    let user = req.user;

    if (mongoose.connection.readyState === 1 && user._id && typeof user.save === 'function') {
      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.location = location || user.location;
      await user.save();
    } else {
      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.location = location || user.location;
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
