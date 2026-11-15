import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

const INITIAL_ACCOUNTS = [
  // Asset Accounts (Balance: 0)
  { code: '1010', name: 'Cash in Hand', type: 'Asset', subType: 'Cash Asset', balance: 0, currency: 'INR' },
  { code: '1020', name: 'Bank Account - Central Bank Current', type: 'Asset', subType: 'Bank Account', balance: 0, currency: 'INR' },
  { code: '1030', name: 'COD Receivable', type: 'Asset', subType: 'Current Asset', balance: 0, currency: 'INR' },
  { code: '1040', name: 'Payment Gateway Clearing', type: 'Asset', subType: 'Current Asset', balance: 0, currency: 'INR' },
  { code: '1050', name: 'Marketplace Clearing', type: 'Asset', subType: 'Current Asset', balance: 0, currency: 'INR' },
  { code: '1060', name: 'Accounts Receivable', type: 'Asset', subType: 'Current Asset', balance: 0, currency: 'INR' },
  { code: '1070', name: 'Inventory/Stock', type: 'Asset', subType: 'Inventory Asset', balance: 0, currency: 'INR' },
  { code: '1080', name: 'Inventory in Transit', type: 'Asset', subType: 'Current Asset', balance: 0, currency: 'INR' },
  { code: '1090', name: 'Security Deposit', type: 'Asset', subType: 'Non-Current Asset', balance: 0, currency: 'INR' },
  { code: '1100', name: 'Computer and Equipment', type: 'Asset', subType: 'Fixed Asset', balance: 0, currency: 'INR' },
  { code: '1110', name: 'Website Development Cost', type: 'Asset', subType: 'Intangible Asset', balance: 0, currency: 'INR' },

  // Partners' Capital Accounts (3 Partners: AJMALSHA, ASHIQUE SALIM, SHANU)
  { code: '2011', name: 'AJMALSHA Capital Account', type: 'Equity', subType: "Partner's Capital", balance: 0, currency: 'INR' },
  { code: '2012', name: 'ASHIQUE SALIM Capital Account', type: 'Equity', subType: "Partner's Capital", balance: 0, currency: 'INR' },
  { code: '2013', name: 'SHANU Capital Account', type: 'Equity', subType: "Partner's Capital", balance: 0, currency: 'INR' },

  // Partners' Drawings Accounts (3 Partners: AJMALSHA, ASHIQUE SALIM, SHANU)
  { code: '2021', name: 'AJMALSHA Drawings Account', type: 'Equity', subType: "Partner's Drawings", balance: 0, currency: 'INR' },
  { code: '2022', name: 'ASHIQUE SALIM Drawings Account', type: 'Equity', subType: "Partner's Drawings", balance: 0, currency: 'INR' },
  { code: '2023', name: 'SHANU Drawings Account', type: 'Equity', subType: "Partner's Drawings", balance: 0, currency: 'INR' },

  // Liabilities
  { code: '2030', name: 'Accounts Payable', type: 'Liability', subType: 'Current Liability', balance: 0, currency: 'INR' },
  { code: '2035', name: 'Supplier Payable', type: 'Liability', subType: 'Current Liability', balance: 0, currency: 'INR' },
  { code: '2040', name: 'Bank Loan (Working Capital)', type: 'Liability', subType: 'Long-term Liability', balance: 0, currency: 'INR' },
  { code: '2050', name: 'GST/VAT Payable (Net Output Tax)', type: 'Liability', subType: 'Current Liability', balance: 0, currency: 'INR' },
  { code: '2060', name: 'Courier Payable', type: 'Liability', subType: 'Current Liability', balance: 0, currency: 'INR' },
  { code: '2070', name: 'Customer Refund Payable', type: 'Liability', subType: 'Current Liability', balance: 0, currency: 'INR' },

  // Revenue Accounts (Balance: 0)
  { code: '3010', name: 'Product Sales Account', type: 'Revenue', subType: 'Operating Revenue', balance: 0, currency: 'INR' },
  { code: '3020', name: 'Shipping Income', type: 'Revenue', subType: 'Operating Revenue', balance: 0, currency: 'INR' },
  { code: '3030', name: 'Other Operating Income', type: 'Revenue', subType: 'Indirect Income', balance: 0, currency: 'INR' },
  { code: '3040', name: 'Sales Return Account', type: 'Revenue', subType: 'Contra Revenue', balance: 0, currency: 'INR' },
  { code: '3050', name: 'Sales Discount Account', type: 'Revenue', subType: 'Contra Revenue', balance: 0, currency: 'INR' },

  // Purchase / Direct Expense Accounts (Balance: 0)
  { code: '4010', name: 'Purchase Account', type: 'Expense', subType: 'Cost of Sales', balance: 0, currency: 'INR' },
  { code: '4020', name: 'Purchase Return Account', type: 'Expense', subType: 'Contra Purchase', balance: 0, currency: 'INR' },
  { code: '4030', name: 'Freight Inward', type: 'Expense', subType: 'Direct Expense', balance: 0, currency: 'INR' },
  { code: '4040', name: 'Packaging Materials', type: 'Expense', subType: 'Direct Expense', balance: 0, currency: 'INR' },
  { code: '4050', name: 'Customs Duty', type: 'Expense', subType: 'Direct Expense', balance: 0, currency: 'INR' },

  // Operating Expense Accounts (Balance: 0)
  { code: '5010', name: 'Advertising and Marketing', type: 'Expense', subType: 'Marketing Expense', balance: 0, currency: 'INR' },
  { code: '5020', name: 'Facebook/Instagram Ads', type: 'Expense', subType: 'Digital Ad Spend', balance: 0, currency: 'INR' },
  { code: '5030', name: 'Website Hosting (AWS/Cloud)', type: 'Expense', subType: 'Tech Infrastructure', balance: 0, currency: 'INR' },
  { code: '5040', name: 'Domain Charges', type: 'Expense', subType: 'Tech Infrastructure', balance: 0, currency: 'INR' },
  { code: '5050', name: 'Payment Gateway Charges', type: 'Expense', subType: 'Financial Expense', balance: 0, currency: 'INR' },
  { code: '5060', name: 'Shipping and Delivery Charges (Outward)', type: 'Expense', subType: 'Logistics', balance: 0, currency: 'INR' },
  { code: '5070', name: 'Office Expenses', type: 'Expense', subType: 'Administrative', balance: 0, currency: 'INR' },
  { code: '5080', name: 'Internet and Telephone', type: 'Expense', subType: 'Utilities', balance: 0, currency: 'INR' },
  { code: '5090', name: 'Software Subscriptions (Shopify/Klaviyo)', type: 'Expense', subType: 'SaaS Software', balance: 0, currency: 'INR' },
  { code: '5100', name: 'Bank Charges', type: 'Expense', subType: 'Financial Expense', balance: 0, currency: 'INR' },
  { code: '5110', name: 'Salary and Wages', type: 'Expense', subType: 'Payroll Personnel', balance: 0, currency: 'INR' },
];

const INITIAL_USERS = [
  {
    _id: 'user_partner_1',
    name: 'AJMALSHA',
    email: 'ajmalsha@cartseven.com',
    role: 'admin',
    location: 'Central Office',
    phone: '+91 98201 44891',
    password: 'password123',
    isActive: true,
  },
  {
    _id: 'user_partner_2',
    name: 'ASHIQUE SALIM',
    email: 'ashique@cartseven.com',
    role: 'accountant',
    location: 'Central Office',
    phone: '+91 98201 44892',
    password: 'password123',
    isActive: true,
  },
  {
    _id: 'user_partner_3',
    name: 'SHANU',
    email: 'shanu@cartseven.com',
    role: 'manager',
    location: 'Central Office',
    phone: '+91 98201 44893',
    password: 'password123',
    isActive: true,
  },
];

export const findAccount = (accounts, query) => {
  if (!query) return null;
  const q = String(query).toLowerCase().trim();
  // 1. Match code exactly
  let match = accounts.find((a) => a.code.toLowerCase() === q);
  if (match) return match;
  // 2. Match exact name
  match = accounts.find((a) => a.name.toLowerCase() === q);
  if (match) return match;
  // 3. Match normalized name (ignoring non-alphanumeric)
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const qNorm = norm(q);
  match = accounts.find((a) => norm(a.name) === qNorm);
  if (match) return match;
  // 4. Substring normalized
  match = accounts.find((a) => norm(a.name).includes(qNorm) || qNorm.includes(norm(a.name)));
  if (match) return match;
  // 5. Keyword heuristics
  if (q.includes('central') || q.includes('cbi') || q.includes('hdfc') || (q.includes('bank') && !q.includes('charge') && !q.includes('loan'))) {
    return accounts.find((a) => a.code === '1020');
  }
  if (q.includes('cash') && !q.includes('discount')) {
    return accounts.find((a) => a.code === '1010');
  }
  if (q.includes('ajmalsha') && (q.includes('capital') || q.includes('equity'))) {
    return accounts.find((a) => a.code === '2011');
  }
  if (q.includes('ashique') && (q.includes('capital') || q.includes('equity'))) {
    return accounts.find((a) => a.code === '2012');
  }
  if (q.includes('shanu') && (q.includes('capital') || q.includes('equity'))) {
    return accounts.find((a) => a.code === '2013');
  }
  if (q.includes('ajmalsha') && q.includes('drawing')) {
    return accounts.find((a) => a.code === '2021');
  }
  if (q.includes('ashique') && q.includes('drawing')) {
    return accounts.find((a) => a.code === '2022');
  }
  if (q.includes('shanu') && q.includes('drawing')) {
    return accounts.find((a) => a.code === '2023');
  }
  if (q.includes('supplier') || q.includes('payable')) {
    return accounts.find((a) => a.code === '2035' || a.code === '2030');
  }
  if (q.includes('receivable') || q.includes('customer')) {
    return accounts.find((a) => a.code === '1060');
  }
  if (q.includes('sales') && !q.includes('return')) {
    return accounts.find((a) => a.code === '3010');
  }
  if (q.includes('purchase') && !q.includes('return')) {
    return accounts.find((a) => a.code === '4010');
  }
  return null;
};

export const applyBalanceChange = (account, isDebit, amount) => {
  if (!account) return;
  const num = Number(amount) || 0;
  if (['Asset', 'Expense'].includes(account.type)) {
    account.balance = Math.round(((Number(account.balance) || 0) + (isDebit ? num : -num)) * 100) / 100;
  } else {
    // Liability, Equity, Revenue
    account.balance = Math.round(((Number(account.balance) || 0) + (isDebit ? -num : num)) * 100) / 100;
  }
};

class LocalStore {
  constructor() {
    this.data = {
      users: [...INITIAL_USERS],
      accounts: INITIAL_ACCOUNTS.map((a) => ({ ...a, balance: 0 })),
      invoices: [],
      expenses: [],
      vouchers: [],
      transactions: [],
      auditLogs: [],
      settings: {
        storeName: 'CartSeven E-Commerce',
        legalEntityName: 'CartSeven Global Retail LLC',
        taxNumber: '27AABCU9603R1ZM',
        contactEmail: 'billing@cartseven.com',
        defaultTaxRate: 18.0,
      },
    };
    this.load();
  }

  load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...this.data,
          ...parsed,
          users: parsed.users?.length ? parsed.users : [...INITIAL_USERS],
          accounts: parsed.accounts?.length ? parsed.accounts : INITIAL_ACCOUNTS.map((a) => ({ ...a, balance: 0 })),
          invoices: parsed.invoices || [],
          expenses: parsed.expenses || [],
          vouchers: (parsed.vouchers || []).filter(
            (v) => v.partyName !== 'AJMALSHA Capital Injection' && v.amount !== 50000
          ),
          transactions: parsed.transactions || [],
          auditLogs: (parsed.auditLogs || []).filter(
            (a) =>
              !(
                a.details &&
                (a.details.includes('50000') || a.details.includes('50,000')) &&
                (a.entity === 'Voucher' || a.details.includes('Receipt Voucher'))
              )
          ),
        };
        this.recalculateBalances();
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('LocalStore load error:', err.message);
    }
  }

  recalculateBalances() {
    // Reset all account balances to 0
    this.data.accounts.forEach((a) => {
      a.balance = 0;
    });

    // Replay all posted vouchers in chronological order
    const sortedVouchers = [...(this.data.vouchers || [])].sort(
      (a, b) => new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime()
    );

    sortedVouchers.forEach((v) => {
      if (v.status !== 'cancelled') {
        const drAcc = findAccount(this.data.accounts, v.debitAccount);
        const crAcc = findAccount(this.data.accounts, v.creditAccount);
        if (drAcc) applyBalanceChange(drAcc, true, v.amount);
        if (crAcc) applyBalanceChange(crAcc, false, v.amount);
      }
    });

    // Replay all expenses
    (this.data.expenses || []).forEach((exp) => {
      const expAcc = this.data.accounts.find(
        (a) => a.code === '5010' || a.name.toLowerCase().includes((exp.category || '').toLowerCase())
      );
      if (expAcc) applyBalanceChange(expAcc, true, exp.amount);

      const isCash = String(exp.paymentMethod || '').toLowerCase().includes('cash');
      const payAcc = isCash
        ? this.data.accounts.find((a) => a.code === '1010')
        : this.data.accounts.find((a) => a.code === '1020');
      if (payAcc) applyBalanceChange(payAcc, false, exp.amount);
    });

    // Replay all invoices
    (this.data.invoices || []).forEach((inv) => {
      const salesAcc = this.data.accounts.find((a) => a.code === '3010');
      if (salesAcc) applyBalanceChange(salesAcc, false, inv.subtotal || inv.totalAmount);

      const taxAcc = this.data.accounts.find((a) => a.code === '2050');
      if (taxAcc && inv.taxAmount) applyBalanceChange(taxAcc, false, inv.taxAmount);

      const paid = Number(inv.amountPaid) || (inv.status === 'paid' ? inv.totalAmount : 0);
      if (paid > 0) {
        const bankAcc = this.data.accounts.find((a) => a.code === '1020');
        if (bankAcc) applyBalanceChange(bankAcc, true, paid);
      }
      const due = (Number(inv.totalAmount) || 0) - paid;
      if (due > 0) {
        const arAcc = this.data.accounts.find((a) => a.code === '1060');
        if (arAcc) applyBalanceChange(arAcc, true, due);
      }
    });
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.warn('LocalStore save error:', err.message);
    }
  }

  clearDummies() {
    this.data.invoices = [];
    this.data.expenses = [];
    this.data.vouchers = [];
    this.data.transactions = [];
    this.data.auditLogs = [];
    this.data.users = [...INITIAL_USERS];
    this.data.accounts = INITIAL_ACCOUNTS.map((a) => ({ ...a, balance: 0 }));
    this.save();
  }
}

export const localStore = new LocalStore();
