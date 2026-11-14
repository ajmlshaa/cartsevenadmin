import mongoose from 'mongoose';

const InvoiceItemSchema = new mongoose.Schema({
  sku: { type: String, default: '' },
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 },
});

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      default: '',
    },
    customerPhone: {
      type: String,
      default: '',
    },
    customerAddress: {
      type: String,
      default: '',
    },
    platform: {
      type: String,
      enum: ['Shopify', 'WooCommerce', 'Amazon', 'Direct Website', 'Custom / Manual'],
      default: 'Direct Website',
    },
    orderReference: {
      type: String,
      default: '',
    },
    items: [InvoiceItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    balanceDue: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'paid', 'partially_paid', 'overdue', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Stripe', 'PayPal', 'Credit Card', 'Bank Transfer', 'Cash on Delivery', 'Other'],
      default: 'Stripe',
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    paidAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdByName: {
      type: String,
      default: 'System',
    },
    location: {
      type: String,
      default: 'Main Store',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Invoice', InvoiceSchema);
