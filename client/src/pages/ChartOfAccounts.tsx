import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Layers,
  ArrowRightLeft,
  Search,
  Filter,
  CheckCircle2,
  X,
  CreditCard,
  Building2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { request } from '../services/api';
import { Account } from '../types';

export const SPECIAL_ECOMMERCE_ACCOUNTS = [
  { code: '1030', name: 'COD Receivable', type: 'Asset', subType: 'Current Asset', purpose: 'Money collected by courier companies but not yet transferred to your bank.', balance: 0 },
  { code: '1040', name: 'Payment Gateway Clearing', type: 'Asset', subType: 'Current Asset', purpose: 'Money collected through payment gateways in T+2 settlement.', balance: 0 },
  { code: '1050', name: 'Marketplace Clearing', type: 'Asset', subType: 'Current Asset', purpose: 'Pending payment settlements from external e-commerce platforms.', balance: 0 },
  { code: '2060', name: 'Courier Payable', type: 'Liability', subType: 'Current Liability', purpose: 'Freight shipping charges payable to courier logistics partners.', balance: 0 },
  { code: '2070', name: 'Customer Refund Payable', type: 'Liability', subType: 'Current Liability', purpose: 'Refunds approved for returns/cancellations but not yet credited to customer.', balance: 0 },
  { code: '1080', name: 'Inventory in Transit', type: 'Asset', subType: 'Current Asset', purpose: 'Stock purchased and dispatched from supplier but not yet received at warehouse.', balance: 0 },
];

export const ESSENTIAL_LEDGER_GROUPS = [
  {
    groupTitle: 'A. Capital and Liability Ledgers',
    badge: 'Capital & Obligations',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    accounts: [
      { code: '2011', name: "AJMALSHA Capital Account", subType: "Partner's Capital", balance: 0, type: 'Equity' },
      { code: '2012', name: "ASHIQUE SALIM Capital Account", subType: "Partner's Capital", balance: 0, type: 'Equity' },
      { code: '2013', name: "SHANU Capital Account", subType: "Partner's Capital", balance: 0, type: 'Equity' },
      { code: '2021', name: "AJMALSHA Drawings Account", subType: "Partner's Drawings", balance: 0, type: 'Equity' },
      { code: '2022', name: "ASHIQUE SALIM Drawings Account", subType: "Partner's Drawings", balance: 0, type: 'Equity' },
      { code: '2023', name: "SHANU Drawings Account", subType: "Partner's Drawings", balance: 0, type: 'Equity' },
      { code: '2030', name: 'Accounts Payable', subType: 'Current Liability', balance: 0, type: 'Liability' },
      { code: '2035', name: 'Supplier Payable', subType: 'Current Liability', balance: 0, type: 'Liability' },
      { code: '2040', name: 'Bank Loan (Working Capital)', subType: 'Long-term Liability', balance: 0, type: 'Liability' },
      { code: '2050', name: 'GST/VAT Payable (Net Output Tax)', subType: 'Current Liability', balance: 0, type: 'Liability' },
      { code: '2060', name: 'Courier Payable (E-Commerce)', subType: 'Current Liability', balance: 0, type: 'Liability' },
      { code: '2070', name: 'Customer Refund Payable (E-Commerce)', subType: 'Current Liability', balance: 0, type: 'Liability' },
    ],
  },
  {
    groupTitle: 'B. Sales and Income Ledgers',
    badge: 'Revenue Streams',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accounts: [
      { code: '3010', name: 'Product Sales Account', subType: 'Operating Revenue', balance: 0, type: 'Revenue' },
      { code: '3020', name: 'Shipping Income', subType: 'Operating Revenue', balance: 0, type: 'Revenue' },
      { code: '3030', name: 'Other Operating Income', subType: 'Indirect Income', balance: 0, type: 'Revenue' },
      { code: '3040', name: 'Sales Return Account', subType: 'Contra Revenue', balance: 0, type: 'Revenue' },
      { code: '3050', name: 'Sales Discount Account', subType: 'Contra Revenue', balance: 0, type: 'Revenue' },
    ],
  },
  {
    groupTitle: 'C. Purchase and Direct Expense Ledgers',
    badge: 'Cost of Sales (COGS)',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    accounts: [
      { code: '4010', name: 'Purchase Account', subType: 'Cost of Sales', balance: 0, type: 'Expense' },
      { code: '4020', name: 'Purchase Return Account', subType: 'Contra Purchase', balance: 0, type: 'Expense' },
      { code: '4030', name: 'Freight Inward', subType: 'Direct Expense', balance: 0, type: 'Expense' },
      { code: '4040', name: 'Packaging Materials', subType: 'Direct Expense', balance: 0, type: 'Expense' },
      { code: '4050', name: 'Customs Duty on Stock Imports', subType: 'Direct Expense', balance: 0, type: 'Expense' },
    ],
  },
  {
    groupTitle: 'D. Operating Expense Ledgers',
    badge: 'Operational Outflows',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    accounts: [
      { code: '5010', name: 'Advertising and Marketing', subType: 'Marketing Expense', balance: 0, type: 'Expense' },
      { code: '5020', name: 'Facebook/Instagram Ads', subType: 'Digital Ad Spend', balance: 0, type: 'Expense' },
      { code: '5030', name: 'Website Hosting (AWS/Cloud)', subType: 'Tech Infrastructure', balance: 0, type: 'Expense' },
      { code: '5040', name: 'Domain Charges', subType: 'Tech Infrastructure', balance: 0, type: 'Expense' },
      { code: '5050', name: 'Payment Gateway Charges', subType: 'Financial Expense', balance: 0, type: 'Expense' },
      { code: '5060', name: 'Shipping and Delivery Charges (Outward)', subType: 'Logistics', balance: 0, type: 'Expense' },
      { code: '5070', name: 'Office Expenses', subType: 'Administrative', balance: 0, type: 'Expense' },
      { code: '5080', name: 'Internet and Telephone', subType: 'Utilities', balance: 0, type: 'Expense' },
      { code: '5090', name: 'Software Subscriptions (Shopify/Klaviyo)', subType: 'SaaS Software', balance: 0, type: 'Expense' },
      { code: '5100', name: 'Bank Charges', subType: 'Financial Expense', balance: 0, type: 'Expense' },
      { code: '5110', name: 'Salary and Wages', subType: 'Payroll Personnel', balance: 0, type: 'Expense' },
    ],
  },
  {
    groupTitle: 'E. Asset Ledgers',
    badge: 'Assets & Capital Property',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    accounts: [
      { code: '1010', name: 'Cash in Hand (Petty Cash Float)', subType: 'Cash Asset', balance: 0, type: 'Asset' },
      { code: '1020', name: 'Bank Account (HDFC Current Account)', subType: 'Bank Account', balance: 0, type: 'Asset' },
      { code: '1030', name: 'COD Receivable (Couriers)', subType: 'Current Asset', balance: 0, type: 'Asset' },
      { code: '1040', name: 'Payment Gateway Clearing', subType: 'Current Asset', balance: 0, type: 'Asset' },
      { code: '1050', name: 'Marketplace Clearing', subType: 'Current Asset', balance: 0, type: 'Asset' },
      { code: '1060', name: 'Accounts Receivable (Customers)', subType: 'Current Asset', balance: 0, type: 'Asset' },
      { code: '1070', name: 'Inventory/Stock (Merchandise Stock)', subType: 'Inventory Asset', balance: 0, type: 'Asset' },
      { code: '1080', name: 'Inventory in Transit (Dispatched Orders)', subType: 'Inventory Asset', balance: 0, type: 'Asset' },
      { code: '1090', name: 'Security Deposit (Warehouse Facilities)', subType: 'Non-Current Asset', balance: 0, type: 'Asset' },
      { code: '1100', name: 'Computer and Equipment', subType: 'Fixed Asset', balance: 0, type: 'Asset' },
      { code: '1110', name: 'Website Development Cost (Capitalized)', subType: 'Intangible Asset', balance: 0, type: 'Asset' },
    ],
  },
];

export const ChartOfAccounts: React.FC = () => {
  const { formatMoney } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [dbAccounts, setDbAccounts] = useState<Account[]>([]);

  // New Account state
  const [name, setName] = useState('');
  const [type, setType] = useState<'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'>('Asset');
  const [subType, setSubType] = useState('');
  const [initialBalance, setInitialBalance] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  const fetchAccounts = async () => {
    try {
      const res = await request<{ success: boolean; data: Account[] }>('/accounts');
      if (res.success && res.data) {
        setDbAccounts(res.data);
      }
    } catch {
      // offline
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const getAccountBalance = (accCode: string, defaultBal: number = 0) => {
    const found = dbAccounts.find((a) => a.code === accCode);
    return found ? (found.balance || 0) : defaultBal;
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Please fill in Ledger Name');
      return;
    }

    const autoCode = 'acc_' + Date.now();

    try {
      await request('/accounts', {
        method: 'POST',
        body: JSON.stringify({
          code: autoCode,
          name,
          type,
          subType,
          balance: Number(initialBalance) || 0,
          description,
        }),
      });
      setShowModal(false);
      setName('');
      setInitialBalance('');
      setDescription('');
      fetchAccounts();
    } catch (err: any) {
      alert(err.message || 'Error creating ledger');
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0A1931] tracking-tight">
            Ledgers
          </h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold text-sm px-6 py-3 rounded-full shadow-lg shadow-orange-500/20 active:scale-[0.98] transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Ledger</span>
        </button>
      </div>

      {/* SPECIAL CLEARING ACCOUNTS */}
      <div className="bg-[#FFF5EF] border border-[#FFE8DC] rounded-3xl p-6 sm:p-8 space-y-5 shadow-[0_4px_20px_-4px_rgba(255,85,0,0.06)]">
        <div className="flex items-center justify-between pb-3 border-b border-[#FFE0D0]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-[#FF5500] text-white flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0A1931]">
              Special Clearing Accounts
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPECIAL_ECOMMERCE_ACCOUNTS.map((acc) => {
            const bal = getAccountBalance(acc.code, acc.balance);
            return (
              <div
                key={acc.code}
                className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        acc.type === 'Asset'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {acc.subType}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-[#0A1931] text-sm mt-1">{acc.name}</h3>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Current Balance:</span>
                  <span className="font-mono font-black text-[#0A1931] text-sm">{formatMoney(bal)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#FF5500] focus:bg-white transition"
          />
        </div>
      </div>

      {/* 5 ESSENTIAL LEDGER GROUPS (A through E) */}
      <div className="space-y-6">
        {ESSENTIAL_LEDGER_GROUPS.map((group, gIdx) => {
          const filteredAccounts = group.accounts
            .map((a) => ({
              ...a,
              balance: getAccountBalance(a.code, a.balance),
            }))
            .filter(
              (a) =>
                !searchTerm ||
                a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.subType.toLowerCase().includes(searchTerm.toLowerCase())
            );

          if (filteredAccounts.length === 0) return null;

          const groupTotal = filteredAccounts.reduce((sum, a) => sum + a.balance, 0);

          return (
            <div
              key={gIdx}
              className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]"
            >
              <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-extrabold text-[#0A1931] text-base">{group.groupTitle}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${group.badgeColor}`}>
                    {group.badge}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-600">
                  Group Net Total: <span className="font-mono text-[#FF5500] text-sm ml-1">{formatMoney(groupTotal)}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                    <tr>
                      <th className="py-3 px-6">Ledger Account Name</th>
                      <th className="py-3 px-6">Classification</th>
                      <th className="py-3 px-6 text-right">Current Ledger Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAccounts.map((acc) => (
                      <tr key={acc.code} className="hover:bg-[#FFFBF8] transition">
                        <td className="py-3.5 px-6 font-bold text-[#0A1931]">{acc.name}</td>
                        <td className="py-3.5 px-6 text-slate-500 font-medium">{acc.subType}</td>
                        <td className="py-3.5 px-6 text-right font-mono font-black text-[#0A1931] text-sm">
                          {formatMoney(acc.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Ledger Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg my-8 p-6 sm:p-8 shadow-2xl space-y-5 text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-[#0A1931]">New Ledger</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ledger Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                >
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sub-Type / Classification</label>
                  <input
                    type="text"
                    value={subType}
                    onChange={(e) => setSubType(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Opening Balance (INR)</label>
                  <input
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition"
                >
                  Create Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
