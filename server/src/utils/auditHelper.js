import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import { localStore } from './localStore.js';

export const logAudit = async ({
  req,
  user,
  action,
  entity,
  entityId,
  details,
}) => {
  try {
    const currentUser = user || req?.user;
    if (!currentUser) return;

    const ipAddress = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';

    const logEntry = {
      _id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user: currentUser._id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      location: currentUser.location || 'HQ',
      action,
      entity,
      entityId: entityId ? String(entityId) : '',
      details,
      ipAddress: String(ipAddress),
      createdAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await AuditLog.create(logEntry);
      } catch (err) {
        // Fallback to localStore
        localStore.data.auditLogs.unshift(logEntry);
        localStore.save();
      }
    } else {
      localStore.data.auditLogs.unshift(logEntry);
      localStore.save();
    }
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};
