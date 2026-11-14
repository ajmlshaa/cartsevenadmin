import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  TrendingDown,
  Trash2,
  Calendar,
  X,
  Building,
  Truck,
  Megaphone,
  Box,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { request } from '../services/api';
import { Expense } from '../types';

export const EXPENSE_CATEGORIES = [
  'Shipping & Freight',
  'Advertising & Marketing (Meta/Google/TikTok)',
  'Platform & Software Fees (Shopify, Hosting)',
  'Inventory Purchase / COGS',
  'Packaging & Warehousing',
  'Payment Processing Fees (Stripe/Razorpay)',
  'Salaries & Contractors',
  'Office & Utilities',
  'Customer Returns & Refund Loss',
  'Other Operating Expenses',
];

export const Expenses: React.FC = () => {
  const { user } = useAuth();
  const { formatMoney } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New Expense form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState<number | ''>('');
  const [taxAmount, setTaxAmount] = useState<number | ''>('');
  const [vendor, setVendor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Corporate Card');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await request<{ success: boolean; data: Expense[] }>(
        `/expenses?category=${categoryFilter}&search=${encodeURIComponent(searchTerm)}`
      );
      if (res.success && res.data) {
        setExpenses(res.data);
      }
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter, searchTerm]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !vendor || !amount || Number(amount) <= 0) {
      alert('Please fill in title, vendor, and amount');
      return;
    }

    try {
      await request('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          title,
          category,
          amount: Number(amount),
          taxAmount: Number(taxAmount),
          paymentMethod,
          vendor,
          date,
          reference,
          notes,
        }),
      });

      setShowModal(false);
      fetchExpenses();
      setTitle('');
      setAmount('');
      setVendor('');
      setReference('');
      setNotes('');
    } catch (err: any) {
      alert(err.message || 'Error creating expense');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Delete this expense entry? This action will be audited.')) {
      try {
        await request(`/expenses/${id}`, { method: 'DELETE' });
        fetchExpenses();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0A1931] tracking-tight">
            Expenses
          </h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold text-sm px-6 py-3 rounded-full shadow-lg shadow-orange-500/20 active:scale-[0.98] transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Expense</span>
        </button>
      </div>

      {/* Expense KPI summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Recorded Outflows</span>
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-[#0A1931]">{formatMoney(totalExpenseSum)}</div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ads & Marketing</span>
            <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center text-[#FF5500]">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-[#FF5500]">
            {formatMoney(
              expenses
                .filter((e) => e.category.includes('Advertising'))
                .reduce((s, e) => s + e.amount, 0)
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory & COGS</span>
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-black text-[#0A1931]">
            {formatMoney(
              expenses
                .filter((e) => e.category.includes('Inventory'))
                .reduce((s, e) => s + e.amount, 0)
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#FF5500] focus:bg-white transition"
          />
        </div>

        <div className="w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-64 bg-[#FAFAFB] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF5500]"
          >
            <option value="all">All Expense Categories</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense List Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FB] text-slate-500 uppercase font-bold tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-4 px-5">Expense #</th>
                <th className="py-4 px-5">Title & Description</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Vendor</th>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5">Amount</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 text-sm">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-[#FFFBF8] transition">
                    <td className="py-4 px-5 font-mono font-bold text-[#FF5500]">
                      {exp.expenseNumber}
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-[#0A1931]">{exp.title}</div>
                      {exp.reference && (
                        <div className="text-[11px] text-slate-400 font-mono">Ref: {exp.reference}</div>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[10px] font-semibold border border-slate-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-700 font-medium">{exp.vendor}</td>
                    <td className="py-4 px-5 text-slate-500 font-mono">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 font-extrabold text-[#0A1931] text-sm font-mono">
                      {formatMoney(exp.amount)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp._id)}
                        title="Delete Expense"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-2xl my-8 p-6 sm:p-8 shadow-2xl space-y-6 text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-[#0A1931]">New Expense</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expense Title / Item *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#FF5500]"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vendor / Payee *</label>
                  <input
                    type="text"
                    required
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0.01"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tax Amount Included</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={taxAmount || ''}
                    onChange={(e) => setTaxAmount(Number(e.target.value))}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#FF5500]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#FF5500]"
                  >
                    <option value="Corporate Card">Corporate Card</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI / Razorpay">UPI / Razorpay</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bill Reference / PO #</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Business Purpose</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold text-xs px-6 py-3 rounded-full shadow-lg shadow-orange-500/20 active:scale-[0.98] transition"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
