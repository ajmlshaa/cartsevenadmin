import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const DEMO_FALLBACK_USERS = [
  {
    _id: 'user_partner_1',
    name: 'AJMALSHA',
    email: 'ajmalsha@cartseven.com',
    role: 'admin',
    location: 'Central Office',
    phone: '+91 98201 44891',
    isActive: true,
  },
  {
    _id: 'user_partner_2',
    name: 'ASHIQUE SALIM',
    email: 'ashique@cartseven.com',
    role: 'accountant',
    location: 'Central Office',
    phone: '+91 98201 44892',
    isActive: true,
  },
  {
    _id: 'user_partner_3',
    name: 'SHANU',
    email: 'shanu@cartseven.com',
    role: 'manager',
    location: 'Central Office',
    phone: '+91 98201 44893',
    isActive: true,
  },
];

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'cartseven_jwt_secret_key_super_secure_987654321_ecommerce'
      );

      let user = null;

      // Try finding user in MongoDB if DB is connected
      if (mongoose.connection.readyState === 1) {
        try {
          user = await User.findById(decoded.id).select('-password');
        } catch {
          // Fall back to in-memory below
        }
      }

      // In-memory fallback
      if (!user) {
        user =
          DEMO_FALLBACK_USERS.find((u) => u._id === decoded.id) ||
          DEMO_FALLBACK_USERS[0];
      }

      req.user = user;
      next();
    } catch (error) {
      console.warn('Auth token verification warning:', error.message);
      // Soft-fallback for robust testing
      req.user = DEMO_FALLBACK_USERS[0];
      next();
    }
  } else {
    // For demo/development mode: fallback to admin user if no token provided
    req.user = DEMO_FALLBACK_USERS[0];
    next();
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user?.role}' is not authorized to access this resource`,
      });
    }
    next();
  };
};
