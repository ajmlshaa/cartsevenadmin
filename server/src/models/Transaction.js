import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => 'txn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    },
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'transfer', 'adjustment'],
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
    accountCode: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    debit: {
      type: Number,
      default: 0,
    },
    credit: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      enum: ['sales_invoice', 'expense_bill', 'bank_deposit', 'manual_journal', 'payout'],
      default: 'manual_journal',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdByName: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Transaction', TransactionSchema);
