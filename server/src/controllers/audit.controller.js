import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import { localStore } from '../utils/localStore.js';

export const getAuditLogs = async (req, res) => {
  try {
    const { action, entity, limit = 50, page = 1 } = req.query;

    let logs = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {};
        if (action && action !== 'all') {
          query.action = action;
        }
        if (entity && entity !== 'all') {
          query.entity = entity;
        }
        const total = await AuditLog.countDocuments(query);
        logs = await AuditLog.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number(limit));

        return res.json({
          success: true,
          total,
          page: Number(page),
          pages: Math.ceil(total / limit) || 1,
          data: logs,
        });
      } catch {
        logs = localStore.data.auditLogs || [];
      }
    } else {
      logs = localStore.data.auditLogs || [];
    }

    if (action && action !== 'all') {
      logs = logs.filter((l) => l.action === action);
    }
    if (entity && entity !== 'all') {
      logs = logs.filter((l) => l.entity === entity);
    }

    const total = logs.length;
    const paginated = logs.slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit) || 1,
      data: paginated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: [] });
  }
};
