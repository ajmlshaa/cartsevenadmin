import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { logAudit } from '../utils/auditHelper.js';
import {
  getAuthorizedMembers,
  findAuthorizedMemberByEmail,
  isAuthorizedMember,
  verifyMemberCredentials,
  getAuthorizedMemberById,
} from '../config/authorizedMembers.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'cartseven_jwt_secret_key_super_secure_987654321_ecommerce', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Get portal access policy & redirect URL
// @route   GET /api/auth/access-info
// @access  Public
export const getAccessInfo = (req, res) => {
  res.json({
    success: true,
    restricted: true,
    redirectUrl: process.env.PUBLIC_REDIRECT_URL || 'https://cartseven.com/',
    portalName: 'CartSeven Accounting & Finance Portal',
    message: 'This site is restricted strictly to 3 authorized partners. Unauthorized visitors are redirected to https://cartseven.com/',
  });
};

// @desc    Auth user & get token (Strictly restricted to 3 authorized partners configured in .env)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Strict Authorization: MUST be one of the 3 authorized partners configured in .env
    const authorizedPartner = findAuthorizedMemberByEmail(cleanEmail);
    if (!authorizedPartner) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You are not an authorized partner of CartSeven. Please visit our public website at https://cartseven.com/.',
        redirectUrl: process.env.PUBLIC_REDIRECT_URL || 'https://cartseven.com/',
        isUnauthorizedVisitor: true,
      });
    }

    // 2. Credential Verification against .env credentials
    let isMatch = verifyMemberCredentials(cleanEmail, password);

    // Optional: Check MongoDB if connected
    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const dbUser = await User.findOne({ email: authorizedPartner.email }).select('+password');
        if (dbUser) {
          const dbMatch = await dbUser.matchPassword(password);
          if (dbMatch) {
            isMatch = true;
          }
          user = dbUser;
        }
      } catch (err) {
        console.warn('MongoDB query warning, using .env credential store:', err.message);
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password for authorized partner account.',
      });
    }

    // User representation from .env
    const userPayload = {
      _id: authorizedPartner._id,
      name: authorizedPartner.name,
      email: authorizedPartner.email,
      role: authorizedPartner.role,
      location: authorizedPartner.location,
      phone: authorizedPartner.phone,
      isActive: true,
      lastLogin: new Date(),
    };

    const token = generateToken(userPayload._id);

    try {
      await logAudit({
        req,
        user: userPayload,
        action: 'LOGIN',
        entity: 'Auth',
        entityId: userPayload._id,
        details: `Authorized Partner ${userPayload.name} logged into CartSeven Portal`,
      });
    } catch {
      // Non-critical audit write failure
    }

    return res.json({
      success: true,
      token,
      user: userPayload,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !isAuthorizedMember(user.email)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only authorized partners of CartSeven may access this system.',
        redirectUrl: process.env.PUBLIC_REDIRECT_URL || 'https://cartseven.com/',
      });
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

    if (!user || !isAuthorizedMember(user.email)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only authorized partners may modify settings.',
        redirectUrl: process.env.PUBLIC_REDIRECT_URL || 'https://cartseven.com/',
      });
    }

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

// @desc    Change password for authenticated partner
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!user || !isAuthorizedMember(user.email)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only authorized partners may modify settings.',
        redirectUrl: process.env.PUBLIC_REDIRECT_URL || 'https://cartseven.com/',
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const isMatch = verifyMemberCredentials(user.email, currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match' });
    }

    const member = findAuthorizedMemberByEmail(user.email);
    if (member) {
      member.password = newPassword;
    }

    if (mongoose.connection.readyState === 1 && user._id && typeof user.save === 'function') {
      user.password = newPassword;
      await user.save();
    }

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
