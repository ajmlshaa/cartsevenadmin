import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: 'Remote',
    },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'STATUS_CHANGE', 'PAYMENT_RECORDED'],
      required: true,
    },
    entity: {
      type: String,
      enum: ['Invoice', 'Expense', 'Account', 'Transaction', 'User', 'Settings', 'Auth'],
      required: true,
    },
    entityId: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('AuditLog', AuditLogSchema);
