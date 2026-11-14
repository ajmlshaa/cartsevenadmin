import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'CartSeven E-Commerce',
    },
    legalEntityName: {
      type: String,
      default: 'CartSeven Global Retail LLC',
    },
    taxNumber: {
      type: String,
      default: 'TAX-98234-CS',
    },
    defaultCurrency: {
      code: { type: String, default: 'INR' },
      symbol: { type: String, default: '₹' },
    },
    fiscalYearStartMonth: {
      type: Number,
      default: 4, // April (Indian Financial Year)
    },
    defaultTaxRate: {
      type: Number,
      default: 18.0, // Standard GST
    },
    address: {
      type: String,
      default: '100 Commerce Way, Suite 400',
    },
    contactEmail: {
      type: String,
      default: 'billing@cartseven.com',
    },
    invoicePrefix: {
      type: String,
      default: 'INV-2026-',
    },
    expensePrefix: {
      type: String,
      default: 'EXP-2026-',
    },
    authorizedLocations: [
      {
        name: String,
        country: String,
        active: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Settings', SettingsSchema);
