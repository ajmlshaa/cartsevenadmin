import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Account from './models/Account.js';
import Invoice from './models/Invoice.js';
import Expense from './models/Expense.js';
import Transaction from './models/Transaction.js';
import AuditLog from './models/AuditLog.js';
import Settings from './models/Settings.js';
import Voucher from './models/Voucher.js';

dotenv.config();

const INITIAL_ACCOUNTS = [
  // Assets (Starting balance: 0)
  { code: '1010', name: 'Cash in Hand', type: 'Asset', subType: 'Cash Asset', balance: 0, currency: 'INR' },
  { code: '1020', name: 'Bank Account - HDFC Current', type: 'Asset', subType: 'Bank Account', balance: 0, currency: 'INR' },
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

const seedData = async () => {
  try {
    const uri = process.env.MONGO_URI;
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log(' Connected to MongoDB Atlas successfully.');

    // Clear existing collections for a clean starting state
    await User.deleteMany();
    await Account.deleteMany();
    await Invoice.deleteMany();
    await Expense.deleteMany();
    await Transaction.deleteMany();
    await AuditLog.deleteMany();
    await Settings.deleteMany();
    await Voucher.deleteMany();

    console.log(' Cleared old collections.');

    // 1. Create the 3 Partners with bcrypt hashed passwords via User.create
    const partners = [
      {
        name: 'AJMALSHA',
        email: 'ajmalsha@cartseven.com',
        password: 'password123',
        role: 'admin',
        location: 'Central Office',
        phone: '+91 98201 44891',
        isActive: true,
      },
      {
        name: 'ASHIQUE SALIM',
        email: 'ashique@cartseven.com',
        password: 'password123',
        role: 'accountant',
        location: 'Central Office',
        phone: '+91 98201 44892',
        isActive: true,
      },
      {
        name: 'SHANU',
        email: 'shanu@cartseven.com',
        password: 'password123',
        role: 'manager',
        location: 'Central Office',
        phone: '+91 98201 44893',
        isActive: true,
      },
    ];

    for (const p of partners) {
      await User.create(p);
    }
    console.log(' Seeded 3 Partners (AJMALSHA, ASHIQUE SALIM, SHANU).');

    // 2. Seed clean accounts at balance 0
    await Account.insertMany(INITIAL_ACCOUNTS);
    console.log(` Seeded ${INITIAL_ACCOUNTS.length} ledger accounts at zero balance.`);

    // 3. Seed Organization Settings
    await Settings.create({
      storeName: 'CartSeven E-Commerce',
      legalEntityName: 'CartSeven E-Commerce Partnership',
      taxNumber: '27AABCU9603R1ZM',
      contactEmail: 'billing@cartseven.com',
      defaultTaxRate: 18.0,
      fiscalYearStart: '4',
      invoicePrefix: 'INV-2026-',
    });
    console.log(' Seeded Organization Settings.');

    console.log(' All MongoDB Atlas initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error(' Seeding error:', error);
    process.exit(1);
  }
};

seedData();
