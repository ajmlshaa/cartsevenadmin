export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'accountant' | 'manager';
  location: string;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  lastLogin?: string;
}

export interface InvoiceItem {
  _id?: string;
  sku?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  platform: 'Shopify' | 'WooCommerce' | 'Amazon' | 'Direct Website' | 'Custom / Manual';
  orderReference?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: 'draft' | 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  paymentMethod: string;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  createdByName?: string;
  location?: string;
  createdAt: string;
}

export interface Expense {
  _id: string;
  expenseNumber: string;
  title: string;
  category: string;
  amount: number;
  taxAmount: number;
  paymentMethod: string;
  vendor: string;
  date: string;
  reference?: string;
  receiptUrl?: string;
  notes?: string;
  status: 'paid' | 'pending_approval' | 'reconciled';
  createdByName?: string;
  location?: string;
  createdAt: string;
}

export interface Account {
  _id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  subType: string;
  balance: number;
  currency: string;
  description?: string;
  isActive: boolean;
  categoryGroup?: string;
  isSpecialEcommerce?: boolean;
}

export type VoucherType =
  | 'Payment Voucher'
  | 'Receipt Voucher'
  | 'Sales Voucher'
  | 'Purchase Voucher'
  | 'Contra Voucher'
  | 'Journal Voucher'
  | 'Credit Note'
  | 'Debit Note';

export type CollectionMethod =
  | 'Cash on Delivery (COD)'
  | 'Online Payment Gateway (Razorpay/Stripe)'
  | 'Marketplace Clearing (Amazon/Flipkart)'
  | 'Direct Bank Transfer (NEFT/RTGS)'
  | 'Cash in Hand'
  | 'Credit / Journal Adjustment';

export interface Voucher {
  _id: string;
  voucherNumber: string;
  type: VoucherType;
  date: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  collectionMethod: CollectionMethod;
  partyName: string;
  referenceNumber?: string;
  narration?: string;
  location?: string;
  createdByName?: string;
  status: 'posted' | 'draft' | 'cancelled';
}

export interface AuditLog {
  _id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  location: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'STATUS_CHANGE' | 'PAYMENT_RECORDED';
  entity: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardKPI {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalReceivables: number;
  cashOnHand: number;
  totalInvoicesCount: number;
  totalExpensesCount: number;
}

export interface MonthlyTrend {
  month: string;
  shortMonth: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface DashboardData {
  kpi: DashboardKPI;
  monthlyTrend: MonthlyTrend[];
  expenseBreakdown: { name: string; value: number }[];
  recentInvoices: Invoice[];
  recentExpenses: Expense[];
  activeUsers: User[];
  recentActivities: AuditLog[];
}
