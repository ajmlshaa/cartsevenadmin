import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema(
  {
    expenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Shipping & Freight',
        'Advertising & Marketing (Meta/Google/TikTok)',
        'Platform & Software Fees (Shopify, Hosting)',
        'Inventory Purchase / COGS',
        'Packaging & Warehousing',
        'Payment Processing Fees (Stripe/PayPal)',
        'Salaries & Contractors',
        'Office & Utilities',
        'Customer Returns & Refund Loss',
        'Other Operating Expenses',
      ],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['Corporate Card', 'Bank Transfer', 'PayPal', 'Cash / Petty Cash', 'Credit Card'],
      default: 'Corporate Card',
    },
    vendor: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    reference: {
      type: String,
      default: '',
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['paid', 'pending_approval', 'reconciled'],
      default: 'paid',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdByName: {
      type: String,
      default: 'Admin',
    },
    location: {
      type: String,
      default: 'Main Office',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Expense', ExpenseSchema);
