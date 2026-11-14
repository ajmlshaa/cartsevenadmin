import mongoose from 'mongoose';

const VoucherSchema = new mongoose.Schema(
  {
    voucherNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'Payment Voucher',
        'Receipt Voucher',
        'Sales Voucher',
        'Purchase Voucher',
        'Contra Voucher',
        'Journal Voucher',
        'Credit Note',
        'Debit Note',
      ],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    debitAccount: {
      type: String,
      required: true,
    },
    creditAccount: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    collectionMethod: {
      type: String,
      enum: [
        'Cash on Delivery (COD)',
        'Online Payment Gateway (Razorpay/Stripe)',
        'Marketplace Clearing (Amazon/Flipkart)',
        'Direct Bank Transfer (NEFT/RTGS)',
        'Cash in Hand',
        'Credit / Journal Adjustment',
      ],
      default: 'Online Payment Gateway (Razorpay/Stripe)',
    },
    partyName: {
      type: String,
      default: 'General / Cash',
    },
    referenceNumber: {
      type: String,
      default: '',
    },
    narration: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: 'HQ - New York, US',
    },
    createdByName: {
      type: String,
      default: 'System User',
    },
    status: {
      type: String,
      enum: ['posted', 'draft', 'cancelled'],
      default: 'posted',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Voucher', VoucherSchema);
