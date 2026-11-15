import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  X,
  Eye,
  Building2,
  Wallet,
  Sparkles,
  CheckCircle2,
  ArrowUpDown,
  ShoppingBag,
  Truck,
  Megaphone,
  Box,
  Layers,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { request } from '../services/api';
import { Voucher } from '../types';

type TransactionMode = 'money_in' | 'money_out' | 'transfer';

export const Vouchers: React.FC = () => {
  const { user } = useAuth();
  const { formatMoney } = useCurrency();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [liveAccounts, setLiveAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'money_in' | 'money_out' | 'transfer'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewingVoucher, setViewingVoucher] = useState<Voucher | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Simple Form State
  const [mode, setMode] = useState<TransactionMode>('money_in');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  // Money In State
  const [moneyInSource, setMoneyInSource] = useState('AJMALSHA Capital Account');
  const [moneyInParty, setMoneyInParty] = useState('AJMALSHA');
  const [depositAccount, setDepositAccount] = useState('Bank Account - Central Bank Current');

  // Money Out State
  const [moneyOutCategory, setMoneyOutCategory] = useState('Purchase Account');
  const [moneyOutParty, setMoneyOutParty] = useState('');
  const [paidFromAccount, setPaidFromAccount] = useState('Bank Account - Central Bank Current');

  // Transfer State
  const [transferFrom, setTransferFrom] = useState('Cash in Hand');
  const [transferTo, setTransferTo] = useState('Bank Account - Central Bank Current');

  // Focus ref
  const amountInputRef = useRef<HTMLInputElement>(null);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await request<{ success: boolean; data: Voucher[] }>(`/vouchers`);
      if (res.success && res.data) {
        setVouchers(res.data);
      }
    } catch {
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await request<{ success: boolean; data: any[] }>('/accounts');
      if (res.success && res.data) {
        setLiveAccounts(res.data);
      }
    } catch {
      // offline
    }
  };

  useEffect(() => {
    fetchVouchers();
    fetchAccounts();
  }, []);

  const openNewTransaction = (initialMode: TransactionMode = 'money_in') => {
    setMode(initialMode);
    setAmount('');
    setNote('');
    if (initialMode === 'money_in') {
      setMoneyInSource('AJMALSHA Capital Account');
      setMoneyInParty('AJMALSHA');
      setDepositAccount('Bank Account - Central Bank Current');
      setNote('Partner capital deposit into Central Bank Current Account');
    } else if (initialMode === 'money_out') {
      setMoneyOutCategory('Purchase Account');
      setMoneyOutParty('');
      setPaidFromAccount('Bank Account - Central Bank Current');
      setNote('Payment from Central Bank Current Account');
    } else {
      setTransferFrom('Cash in Hand');
      setTransferTo('Bank Account - Central Bank Current');
      setNote('Cash deposited into Central Bank Current Account');
    }
    setShowModal(true);
    setTimeout(() => {
      amountInputRef.current?.focus();
    }, 100);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount greater than ₹ 0.');
      amountInputRef.current?.focus();
      return;
    }

    setSaving(true);
    try {
      let payload: any = {};

      if (mode === 'money_in') {
        payload = {
          type: 'Receipt Voucher',
          date,
          debitAccount: depositAccount,
          creditAccount: moneyInSource,
          amount: Number(amount),
          partyName: moneyInParty || 'Deposit',
          narration: note || 'Money received into ' + depositAccount,
          collectionMethod: depositAccount.includes('Bank') ? 'Direct Bank Transfer (NEFT/RTGS)' : 'Cash in Hand',
        };
      } else if (mode === 'money_out') {
        const isStock = moneyOutCategory === 'Purchase Account';
        payload = {
          type: isStock ? 'Purchase Voucher' : 'Payment Voucher',
          date,
          debitAccount: moneyOutCategory,
          creditAccount: paidFromAccount,
          amount: Number(amount),
          partyName: moneyOutParty.trim() || 'Vendor / Expense',
          narration: note || 'Payment made from ' + paidFromAccount,
          collectionMethod: paidFromAccount.includes('Bank') ? 'Direct Bank Transfer (NEFT/RTGS)' : 'Cash in Hand',
        };
      } else {
        // Transfer
        payload = {
          type: 'Contra Voucher',
          date,
          debitAccount: transferTo,
          creditAccount: transferFrom,
          amount: Number(amount),
          partyName: 'Internal Transfer',
          narration: note || `Transfer from ${transferFrom} to ${transferTo}`,
          collectionMethod: 'Cash in Hand',
        };
      }

      const res = await request<{ success: boolean; data: Voucher }>('/vouchers', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setToastMessage(`✓ Transaction saved! (${formatMoney(Number(amount))})`);
        setTimeout(() => setToastMessage(null), 4000);
        setShowModal(false);
        fetchVouchers();
        fetchAccounts();
      }
    } catch (err: any) {
      alert(err.message || 'Error recording transaction');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this transaction? The accounting balances will be automatically reversed.')) {
      try {
        await request(`/vouchers/${id}`, { method: 'DELETE' });
        fetchVouchers();
        fetchAccounts();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Helper to get real live account balance
  const getAccountBalance = (accountNameOrCode: string) => {
    const q = accountNameOrCode.toLowerCase();
    const acc = liveAccounts.find(
      (a) => a.code.toLowerCase() === q || a.name.toLowerCase() === q || a.name.toLowerCase().includes(q)
    );
    return acc ? acc.balance || 0 : 0;
  };

  // Live Metric Balances
  const centralBankBalance = getAccountBalance('1020');
  const cashBalance = getAccountBalance('1010');

  // Compute Inflow & Outflow
  const totalMoneyIn = vouchers
    .filter((v) => v.type === 'Receipt Voucher' || v.type === 'Sales Voucher')
    .reduce((sum, v) => sum + (Number(v.amount) || 0), 0);

  const totalMoneyOut = vouchers
    .filter((v) => v.type === 'Payment Voucher' || v.type === 'Purchase Voucher')
    .reduce((sum, v) => sum + (Number(v.amount) || 0), 0);

  // Filtered List
  const filteredVouchers = vouchers.filter((v) => {
    const isMoneyIn = v.type === 'Receipt Voucher' || v.type === 'Sales Voucher';
    const isMoneyOut = v.type === 'Payment Voucher' || v.type === 'Purchase Voucher';
    const isTransfer = v.type === 'Contra Voucher';

    if (filterMode === 'money_in' && !isMoneyIn) return false;
    if (filterMode === 'money_out' && !isMoneyOut) return false;
    if (filterMode === 'transfer' && !isTransfer) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchParty = v.partyName?.toLowerCase().includes(q);
      const matchNarration = v.narration?.toLowerCase().includes(q);
      const matchVoucherNo = v.voucherNumber?.toLowerCase().includes(q);
      const matchAmount = String(v.amount).includes(q);
      return matchParty || matchNarration || matchVoucherNo || matchAmount;
    }
    return true;
  });

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] bg-[#0A1931] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
            ✓
          </div>
          <span className="font-semibold text-xs text-slate-100">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header with Big Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0A1931] tracking-tight">Transactions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Simple & automated money management for CartSeven
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openNewTransaction('money_in')}
            className="inline-flex items-center justify-center gap-2 bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold text-sm px-6 py-3 rounded-full shadow-lg shadow-orange-500/20 active:scale-[0.98] transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 2. Three Clean Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Central Bank Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Central Bank Balance
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0A1931] mt-2 tracking-tight">
              {formatMoney(centralBankBalance)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Current A/C • Cash: {formatMoney(cashBalance)}
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Money In Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Total Money In (Received)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2 tracking-tight">
              +{formatMoney(totalMoneyIn)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Capital deposits & customer sales</div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        {/* Money Out Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              Total Money Out (Spent)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-2 tracking-tight">
              -{formatMoney(totalMoneyOut)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Inventory, ads, shipping & drawings</div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filterMode === 'all'
                ? 'bg-[#0A1931] text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setFilterMode('money_in')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'money_in'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Money In</span>
          </button>
          <button
            onClick={() => setFilterMode('money_out')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'money_out'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Money Out</span>
          </button>
          <button
            onClick={() => setFilterMode('transfer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'transfer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfers</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search party, notes, amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white transition"
          />
        </div>
      </div>

      {/* 4. Transactions List */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FB] text-slate-500 uppercase font-bold tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5">Type</th>
                <th className="py-4 px-5">Details / Purpose</th>
                <th className="py-4 px-5">Party / Person</th>
                <th className="py-4 px-5">Account</th>
                <th className="py-4 px-5 text-right">Amount</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-slate-400">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-orange-50 text-[#FF5500] flex items-center justify-center mx-auto">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div className="font-extrabold text-sm text-[#0A1931]">No transactions yet</div>
                      <p className="text-xs text-slate-400">
                        Record your first Money In (capital/sales) or Money Out (expenses/stock) in one click.
                      </p>
                      <button
                        onClick={() => openNewTransaction('money_in')}
                        className="inline-flex items-center gap-1.5 bg-[#FF5500] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-[#E04B00] transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Entry</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => {
                  const isMoneyIn = v.type === 'Receipt Voucher' || v.type === 'Sales Voucher';
                  const isTransfer = v.type === 'Contra Voucher';

                  return (
                    <tr key={v._id} className="hover:bg-[#FFFBF8] transition">
                      {/* Date */}
                      <td className="py-4 px-5 font-semibold text-slate-600 whitespace-nowrap">
                        {new Date(v.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        <div className="text-[10px] text-slate-400 font-mono">{v.voucherNumber}</div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {isMoneyIn ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ArrowDownLeft className="w-3 h-3" />
                            <span>Money In</span>
                          </span>
                        ) : isTransfer ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Transfer</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Money Out</span>
                          </span>
                        )}
                      </td>

                      {/* Purpose / Details */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-[#0A1931]">
                          {v.narration || (isMoneyIn ? v.creditAccount : v.debitAccount)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isMoneyIn ? `Category: ${v.creditAccount}` : `Category: ${v.debitAccount}`}
                        </div>
                      </td>

                      {/* Party */}
                      <td className="py-4 px-5 font-medium text-slate-700">
                        {v.partyName || '-'}
                      </td>

                      {/* Bank / Cash Account */}
                      <td className="py-4 px-5 font-medium text-slate-600">
                        {isMoneyIn ? v.debitAccount : v.creditAccount}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-5 text-right font-black text-sm whitespace-nowrap">
                        {isMoneyIn ? (
                          <span className="text-emerald-600">+{formatMoney(v.amount)}</span>
                        ) : isTransfer ? (
                          <span className="text-blue-600">{formatMoney(v.amount)}</span>
                        ) : (
                          <span className="text-rose-600">-{formatMoney(v.amount)}</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(v._id)}
                          title="Delete transaction and reverse balance"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. SUPER SIMPLE 3-OPTION TRANSACTION MODAL                                */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col my-auto">
            {/* Modal Header */}
            <div className="bg-[#0A1931] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-xl bg-[#FF5500] text-white font-black text-sm flex items-center justify-center">
                  7
                </span>
                <div>
                  <div className="font-extrabold text-base text-white">Record Transaction</div>
                  <div className="text-xs text-slate-400">
                    Real-time double-entry bookkeeping for CartSeven
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveTransaction} className="p-6 space-y-5 bg-[#FAFAFB]/60">
              {/* 3 Big Tabs: Money In, Money Out, Transfer */}
              <div className="grid grid-cols-3 gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <button
                  type="button"
                  onClick={() => openNewTransaction('money_in')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'money_in'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Money In</span>
                </button>

                <button
                  type="button"
                  onClick={() => openNewTransaction('money_out')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'money_out'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Money Out</span>
                </button>

                <button
                  type="button"
                  onClick={() => openNewTransaction('transfer')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'transfer'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Transfer</span>
                </button>
              </div>

              {/* Form Content Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                {/* 🟢 TAB 1: MONEY IN FIELDS */}
                {mode === 'money_in' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">
                        Who gave the money? / Income Source *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMoneyInSource('AJMALSHA Capital Account');
                            setMoneyInParty('AJMALSHA');
                            setNote('Capital deposit by AJMALSHA');
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                            moneyInSource === 'AJMALSHA Capital Account'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          👤 AJMALSHA Capital
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMoneyInSource('ASHIQUE SALIM Capital Account');
                            setMoneyInParty('ASHIQUE SALIM');
                            setNote('Capital deposit by ASHIQUE SALIM');
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                            moneyInSource === 'ASHIQUE SALIM Capital Account'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          👤 ASHIQUE SALIM Capital
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMoneyInSource('SHANU Capital Account');
                            setMoneyInParty('SHANU');
                            setNote('Capital deposit by SHANU');
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                            moneyInSource === 'SHANU Capital Account'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          👤 SHANU Capital
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMoneyInSource('Product Sales Account');
                            setMoneyInParty('Website Customer');
                            setNote('Sales order revenue');
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                            moneyInSource === 'Product Sales Account'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          🛒 Website Sales
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMoneyInSource('Marketplace Clearing');
                            setMoneyInParty('Amazon / Flipkart');
                            setNote('Marketplace settlement payout');
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                            moneyInSource === 'Marketplace Clearing'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          🌐 Marketplace Payout
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMoneyInSource('Other Operating Income');
                            setMoneyInParty('Direct');
                            setNote('Other miscellaneous income');
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                            moneyInSource === 'Other Operating Income'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          📦 Other Income
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Deposit Money Into *
                      </label>
                      <select
                        value={depositAccount}
                        onChange={(e) => setDepositAccount(e.target.value)}
                        className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Bank Account - Central Bank Current">
                          Bank Account - Central Bank Current (Live: {formatMoney(centralBankBalance)})
                        </option>
                        <option value="Cash in Hand">
                          Cash in Hand (Live: {formatMoney(cashBalance)})
                        </option>
                      </select>
                    </div>
                  </>
                )}

                {/* 🔴 TAB 2: MONEY OUT FIELDS */}
                {mode === 'money_out' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">
                        What was this spent on? / Purpose *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMoneyOutCategory('Purchase Account');
                            setNote('Inventory stock purchase from supplier');
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                            moneyOutCategory === 'Purchase Account'
                              ? 'bg-rose-50 border-rose-500 text-rose-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          📦 Stock / Inventory
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMoneyOutCategory('Facebook/Instagram Ads');
                            setMoneyOutParty('Meta Platforms');
                            setNote('Meta/Google Ad Spend');
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                            moneyOutCategory === 'Facebook/Instagram Ads'
                              ? 'bg-rose-50 border-rose-500 text-rose-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          📢 Meta / Google Ads
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMoneyOutCategory('Shipping and Delivery Charges (Outward)');
                            setMoneyOutParty('Delhivery / Courier');
                            setNote('Courier freight charges');
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                            moneyOutCategory === 'Shipping and Delivery Charges (Outward)'
                              ? 'bg-rose-50 border-rose-500 text-rose-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          🚚 Shipping & Courier
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMoneyOutCategory('Software Subscriptions (Shopify/Klaviyo)');
                            setMoneyOutParty('Shopify');
                            setNote('Shopify / Hosting software fee');
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                            moneyOutCategory === 'Software Subscriptions (Shopify/Klaviyo)'
                              ? 'bg-rose-50 border-rose-500 text-rose-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          🛠️ Software & Tools
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMoneyOutCategory('AJMALSHA Drawings Account');
                            setMoneyOutParty('AJMALSHA');
                            setNote('Partner profit drawings withdrawal');
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                            moneyOutCategory === 'AJMALSHA Drawings Account'
                              ? 'bg-rose-50 border-rose-500 text-rose-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          💸 Drawings (AJMALSHA)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMoneyOutCategory('ASHIQUE SALIM Drawings Account');
                            setMoneyOutParty('ASHIQUE SALIM');
                            setNote('Partner profit drawings withdrawal');
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                            moneyOutCategory === 'ASHIQUE SALIM Drawings Account'
                              ? 'bg-rose-50 border-rose-500 text-rose-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          💸 Drawings (ASHIQUE)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMoneyOutCategory('SHANU Drawings Account');
                            setMoneyOutParty('SHANU');
                            setNote('Partner profit drawings withdrawal');
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                            moneyOutCategory === 'SHANU Drawings Account'
                              ? 'bg-rose-50 border-rose-500 text-rose-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          💸 Drawings (SHANU)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMoneyOutCategory('Office Expenses');
                            setNote('Office administrative expense');
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                            moneyOutCategory === 'Office Expenses'
                              ? 'bg-rose-50 border-rose-500 text-rose-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          🏢 Office & Utilities
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMoneyOutCategory('Packaging Materials');
                            setNote('Carton boxes & packaging');
                          }}
                          className={`p-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                            moneyOutCategory === 'Packaging Materials'
                              ? 'bg-rose-50 border-rose-500 text-rose-800'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          📦 Packaging Material
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Paid From Account *
                        </label>
                        <select
                          value={paidFromAccount}
                          onChange={(e) => setPaidFromAccount(e.target.value)}
                          className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-rose-500"
                        >
                          <option value="Bank Account - Central Bank Current">
                            Central Bank (Live: {formatMoney(centralBankBalance)})
                          </option>
                          <option value="Cash in Hand">
                            Cash in Hand (Live: {formatMoney(cashBalance)})
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Paid To (Vendor / Person)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Supplier Name, Meta, Ajmalsha"
                          value={moneyOutParty}
                          onChange={(e) => setMoneyOutParty(e.target.value)}
                          className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 🔄 TAB 3: TRANSFER FIELDS */}
                {mode === 'transfer' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">From Account *</label>
                        <select
                          value={transferFrom}
                          onChange={(e) => setTransferFrom(e.target.value)}
                          className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                        >
                          <option value="Cash in Hand">Cash in Hand ({formatMoney(cashBalance)})</option>
                          <option value="Bank Account - Central Bank Current">
                            Central Bank ({formatMoney(centralBankBalance)})
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">To Account *</label>
                        <select
                          value={transferTo}
                          onChange={(e) => setTransferTo(e.target.value)}
                          className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                        >
                          <option value="Bank Account - Central Bank Current">
                            Central Bank ({formatMoney(centralBankBalance)})
                          </option>
                          <option value="Cash in Hand">Cash in Hand ({formatMoney(cashBalance)})</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Row: Amount & Date (Common to all modes) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-black text-slate-900 block mb-1">Amount (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-400 font-black text-sm">₹</span>
                      <input
                        ref={amountInputRef}
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-[#FAFAFB] border border-slate-300 rounded-xl pl-8 pr-3 py-2.5 text-base font-black text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Note / Description</label>
                  <input
                    type="text"
                    placeholder="Short description or transaction memo"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#FF5500]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                    saving ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    mode === 'money_in'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                      : mode === 'money_out'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {saving
                      ? 'Saving & Updating Ledger...'
                      : mode === 'money_in'
                      ? 'Save Money In Entry'
                      : mode === 'money_out'
                      ? 'Save Money Out Entry'
                      : 'Save Bank Transfer'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
