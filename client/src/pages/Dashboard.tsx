import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  CreditCard,
  Truck,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { request } from '../services/api';
import { Invoice } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { formatMoney } = useCurrency();

  const [kpi, setKpi] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    totalReceivables: 0,
    cashOnHand: 0,
    totalInvoicesCount: 0,
    totalExpensesCount: 0,
  });

  const [clearingAccounts, setClearingAccounts] = useState({
    codReceivable: 0,
    paymentGatewayClearing: 0,
    marketplaceClearing: 0,
    customerRefunds: 0,
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await request<any>('/dashboard/summary');
        if (res.success && res.data) {
          if (res.data.kpi) setKpi(res.data.kpi);
          if (res.data.clearingAccounts) setClearingAccounts(res.data.clearingAccounts);
          if (res.data.monthlyTrend) setChartData(res.data.monthlyTrend);
          if (res.data.recentInvoices) setInvoices(res.data.recentInvoices);
        }
      } catch (err) {
        // defaults remain 0
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* 1. Header & KPI Summary Cards */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Dashboard</h1>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Net Revenue</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-2">
            {formatMoney(kpi.totalRevenue)}
          </div>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Expenses</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-2">
            {formatMoney(kpi.totalExpenses)}
          </div>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Margin</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#FF5500] tracking-tight mt-2">
            {kpi.profitMargin}%
          </div>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cash & Bank Balance</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-2">
            {formatMoney(kpi.cashOnHand)}
          </div>
        </div>
      </section>

      {/* 2. PERFORMANCE CHART & CLEARING ACCOUNTS GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Performance Trajectory (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-extrabold text-[#0F172A]">Revenue & Expenditure</h3>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F172A]"></span>
                <span className="text-slate-700">Gross Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500]"></span>
                <span className="text-[#FF5500]">Expenditure</span>
              </div>
            </div>
          </div>

          <div className="h-68 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5500" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF5500" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(value: any) => [`₹ ${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0F172A" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="expenditure" stroke="#FF5500" strokeWidth={2.5} fillOpacity={1} fill="url(#expGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Clearing Accounts (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/70 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-[#0F172A] text-sm">Clearing Accounts</h3>
            <Link to="/accounts" className="text-xs font-bold text-[#FF5500] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-[#FAFAFB] border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5500] flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="font-bold text-[#0F172A]">COD Receivable</div>
              </div>
              <span className="font-mono font-black text-[#0F172A]">{formatMoney(clearingAccounts.codReceivable)}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAFAFB] border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="font-bold text-[#0F172A]">Payment Gateway Clearing</div>
              </div>
              <span className="font-extrabold text-[#0F172A] tracking-tight">{formatMoney(clearingAccounts.paymentGatewayClearing)}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAFAFB] border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="font-bold text-[#0F172A]">Marketplace Clearing</div>
              </div>
              <span className="font-extrabold text-[#0F172A] tracking-tight">{formatMoney(clearingAccounts.marketplaceClearing)}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAFAFB] border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div className="font-bold text-[#0F172A]">Customer Refunds</div>
              </div>
              <span className="font-extrabold text-rose-600 tracking-tight">{formatMoney(clearingAccounts.customerRefunds)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RECENT INVOICES TABLE */}
      <section className="bg-white border border-slate-200/70 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">Recent Invoices</h3>
          <Link
            to="/invoices"
            className="text-xs font-bold text-[#FF5500] hover:underline flex items-center gap-1"
          >
            <span>View All ({invoices.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-4 px-6 w-12">
                  <input type="checkbox" className="accent-[#FF5500] rounded cursor-pointer" />
                </th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Sales Channel</th>
                <th className="py-4 px-4">Invoice #</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Total (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 text-sm">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const isSelected = !!selectedRows[inv._id];
                  return (
                    <tr
                      key={inv._id}
                      className={`hover:bg-[#FFFBF8] transition ${
                        isSelected ? 'bg-orange-50/20' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(inv._id)}
                          className="accent-[#FF5500] rounded cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-4 font-bold text-[#0F172A]">
                        <div>{inv.customerName}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[10px] font-semibold border border-slate-200">
                          {inv.platform || 'Direct Website'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#FF5500]">
                        <Link to={`/invoices`} className="hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        {(inv.issueDate || inv.createdAt || '').split('T')[0]}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inv.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-extrabold text-[#0F172A] font-mono text-sm">
                        {formatMoney(inv.totalAmount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
