import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
    },
    subType: {
      type: String,
      required: true,
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Account', AccountSchema);
