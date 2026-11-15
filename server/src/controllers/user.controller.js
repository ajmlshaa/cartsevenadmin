import mongoose from 'mongoose';
import User from '../models/User.js';
import { logAudit } from '../utils/auditHelper.js';
import { localStore } from '../utils/localStore.js';
import { getPublicAuthorizedMembers, isAuthorizedMember } from '../config/authorizedMembers.js';

// @desc    Get all team users
// @route   GET /api/users
export const getUsers = async (req, res) => {
  try {
    let users = [];
    if (mongoose.connection.readyState === 1) {
      try {
        users = await User.find().select('-password').sort({ createdAt: -1 });
      } catch {
        users = (localStore.data.users || []).map(({ password, ...u }) => u);
      }
    } else {
      users = (localStore.data.users || []).map(({ password, ...u }) => u);
    }

    if (!users || users.length === 0) {
      users = getPublicAuthorizedMembers();
    } else {
      const filtered = users.filter((u) => isAuthorizedMember(u.email));
      users = filtered.length > 0 ? filtered : getPublicAuthorizedMembers();
    }

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new user (admin only)
// @route   POST /api/users
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, location, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    if (mongoose.connection.readyState === 1) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'accountant',
        location: location || 'Remote',
        phone: phone || '',
      });

      await logAudit({
        req,
        action: 'CREATE',
        entity: 'User',
        entityId: user._id,
        details: `Added new user ${user.name} (${user.role}) located at ${user.location}`,
      });

      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location,
          phone: user.phone,
          isActive: user.isActive,
        },
        message: 'Team user created successfully',
      });
    } else {
      const exists = localStore.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      const newUser = {
        _id: 'user_' + Date.now(),
        name,
        email,
        password,
        role: role || 'accountant',
        location: location || 'Central Office',
        phone: phone || '',
        isActive: true,
      };

      localStore.data.users.push(newUser);
      localStore.save();

      const { password: _, ...cleanUser } = newUser;
      return res.status(201).json({
        success: true,
        data: cleanUser,
        message: 'Team user created successfully',
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user (location, role, status)
// @route   PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { name, role, location, phone, isActive, password } = req.body;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name) user.name = name;
      if (role) user.role = role;
      if (location) user.location = location;
      if (phone !== undefined) user.phone = phone;
      if (isActive !== undefined) user.isActive = isActive;
      if (password) user.password = password;

      await user.save();

      await logAudit({
        req,
        action: 'UPDATE',
        entity: 'User',
        entityId: user._id,
        details: `Updated team user ${user.name} (Location: ${user.location}, Role: ${user.role})`,
      });

      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          location: user.location,
          phone: user.phone,
          isActive: user.isActive,
        },
        message: 'User updated successfully',
      });
    } else {
      const user = (localStore.data.users || []).find((u) => u._id === req.params.id || u.email === req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (name) user.name = name;
      if (role) user.role = role;
      if (location) user.location = location;
      if (phone !== undefined) user.phone = phone;
      if (isActive !== undefined) user.isActive = isActive;
      if (password) user.password = password;

      localStore.save();

      const { password: _, ...cleanUser } = user;
      return res.json({
        success: true,
        data: cleanUser,
        message: 'User updated successfully',
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
