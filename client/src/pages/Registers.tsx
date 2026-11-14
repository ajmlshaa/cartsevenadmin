import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  ShoppingCart,
  Package,
  Users,
  Building,
  RotateCcw,
  CreditCard,
  Truck,
  DollarSign,
  Landmark,
  BookOpen,
  Printer,
  ShoppingBag,
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { request } from '../services/api';

interface RegisterTab {
  id: string;
  name: string;
  icon: any;
}

const REGISTERS_LIST: RegisterTab[] = [
  { id: 'sales', name: 'Sales Register', icon: ShoppingBag },
  { id: 'purchases', name: 'Purchase Register', icon: ShoppingCart },
  { id: 'stock', name: 'Stock Register', icon: Package },
  { id: 'customers', name: 'Customer Register', icon: Users },
  { id: 'suppliers', name: 'Supplier Register', icon: Building },
  { id: 'orders', name: 'Order Register', icon: FileSpreadsheet },
  { id: 'returns', name: 'Return Register', icon: RotateCcw },
  { id: 'payments', name: 'Payment Register', icon: CreditCard },
  { id: 'deliveries', name: 'Delivery Register', icon: Truck },
  { id: 'expenses', name: 'Expense Register', icon: DollarSign },
  { id: 'bankReconciliation', name: 'Bank Reconciliation', icon: Landmark },
  { id: 'cashBook', name: 'Daily Cash Book', icon: BookOpen },
];

export const Registers: React.FC = () => {
  const { formatMoney } = useCurrency();
  const [activeRegister, setActiveRegister] = useState<string>('sales');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setData(null);
        const res = await request<any>(`/registers/${activeRegister}`);
        if (res?.data) {
          setData(res.data);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeRegister]);

  const renderEmptyRow = (colSpan: number) => (
    <tr>
      <td colSpan={colSpan} className="text-center py-16 text-slate-400 text-sm">
        No records found.
      </td>
    </tr>
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0A1931] tracking-tight">
            Registers
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-full shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* 12 Registers Tab Pill Navigation */}
      <div className="bg-white border border-slate-100 rounded-3xl p-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {REGISTERS_LIST.map((reg) => {
            const Icon = reg.icon;
            const isActive = activeRegister === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => setActiveRegister(reg.id)}
                className={`p-3 rounded-2xl text-left transition flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#FF5500] text-white shadow-md shadow-orange-500/20'
                    : 'bg-[#FAFAFB] hover:bg-[#FFF5EF] border border-slate-200/80 text-slate-700 hover:text-[#0A1931]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#FF5500]'}`} />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">{reg.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. SALES REGISTER */}
      {activeRegister === 'sales' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Sales Register</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-5">Reg ID</th>
                  <th className="py-3.5 px-5">Order #</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Platform</th>
                  <th className="py-3.5 px-5 text-right">Taxable Val</th>
                  <th className="py-3.5 px-5 text-right">GST (18%)</th>
                  <th className="py-3.5 px-5 text-right">Invoice Total</th>
                  <th className="py-3.5 px-5">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#FF5500]">{row.id}</td>
                      <td className="py-3.5 px-5 font-mono font-bold text-[#0A1931]">{row.orderId}</td>
                      <td className="py-3.5 px-5 text-slate-500 font-mono">{row.date}</td>
                      <td className="py-3.5 px-5 font-bold text-[#0A1931]">{row.customer}</td>
                      <td className="py-3.5 px-5"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">{row.platform}</span></td>
                      <td className="py-3.5 px-5 text-right font-mono">{formatMoney(row.taxableAmount)}</td>
                      <td className="py-3.5 px-5 text-right font-mono text-slate-500">{formatMoney(row.gstAmount)}</td>
                      <td className="py-3.5 px-5 text-right font-mono font-black text-[#0A1931]">{formatMoney(row.totalAmount)}</td>
                      <td className="py-3.5 px-5"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">{row.paymentStatus}</span></td>
                    </tr>
                  ))
                ) : (
                  renderEmptyRow(9)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. PURCHASE REGISTER */}
      {activeRegister === 'purchases' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Purchase Register</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-5">Bill #</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Supplier / Payee</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Item Description</th>
                  <th className="py-3.5 px-5 text-right">Taxable</th>
                  <th className="py-3.5 px-5 text-right">Total Bill</th>
                  <th className="py-3.5 px-5">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#FF5500]">{row.billNo}</td>
                      <td className="py-3.5 px-5 font-mono text-slate-500">{row.date}</td>
                      <td className="py-3.5 px-5 font-bold text-[#0A1931]">{row.supplier}</td>
                      <td className="py-3.5 px-5"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">{row.category}</span></td>
                      <td className="py-3.5 px-5 text-slate-600">{row.items}</td>
                      <td className="py-3.5 px-5 text-right font-mono">{formatMoney(row.taxableAmount)}</td>
                      <td className="py-3.5 px-5 text-right font-mono font-black text-[#0A1931]">{formatMoney(row.totalAmount)}</td>
                      <td className="py-3.5 px-5"><span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">{row.paymentStatus}</span></td>
                    </tr>
                  ))
                ) : (
                  renderEmptyRow(8)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. STOCK REGISTER */}
      {activeRegister === 'stock' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Stock Register</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-5">SKU</th>
                  <th className="py-3.5 px-5">Product Name</th>
                  <th className="py-3.5 px-5 text-center">Opening</th>
                  <th className="py-3.5 px-5 text-center text-emerald-600">Inward (+)</th>
                  <th className="py-3.5 px-5 text-center text-rose-500">Outward (-)</th>
                  <th className="py-3.5 px-5 text-center font-bold text-[#0A1931]">Closing Stock</th>
                  <th className="py-3.5 px-5 text-right">Unit Cost</th>
                  <th className="py-3.5 px-5 text-right">Total Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#FF5500]">{row.sku}</td>
                      <td className="py-3.5 px-5 font-bold text-[#0A1931]">{row.name}</td>
                      <td className="py-3.5 px-5 text-center font-mono">{row.openingStock}</td>
                      <td className="py-3.5 px-5 text-center font-mono font-bold text-emerald-600">+{row.inward}</td>
                      <td className="py-3.5 px-5 text-center font-mono font-bold text-rose-500">-{row.outward}</td>
                      <td className="py-3.5 px-5 text-center font-mono font-black text-sm text-[#0A1931]">{row.closingStock}</td>
                      <td className="py-3.5 px-5 text-right font-mono">{formatMoney(row.unitCost)}</td>
                      <td className="py-3.5 px-5 text-right font-mono font-black text-[#FF5500]">{formatMoney(row.valuation)}</td>
                    </tr>
                  ))
                ) : (
                  renderEmptyRow(8)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CUSTOMER REGISTER */}
      {activeRegister === 'customers' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Customer Register</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-5">Customer ID</th>
                  <th className="py-3.5 px-5">Name & Email</th>
                  <th className="py-3.5 px-5">Location</th>
                  <th className="py-3.5 px-5 text-center">Orders</th>
                  <th className="py-3.5 px-5 text-right">Lifetime Spend</th>
                  <th className="py-3.5 px-5 text-right">Balance Due</th>
                  <th className="py-3.5 px-5">Payment Terms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#FF5500]">{row.customerId}</td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-[#0A1931]">{row.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{row.email}</div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">{row.location}</td>
                      <td className="py-3.5 px-5 text-center font-mono font-bold">{row.totalOrders}</td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-[#0A1931]">{formatMoney(row.lifetimeSpend)}</td>
                      <td className="py-3.5 px-5 text-right font-mono font-black text-rose-500">
                        {row.outstandingBalance > 0 ? formatMoney(row.outstandingBalance) : '₹0.00'}
                      </td>
                      <td className="py-3.5 px-5"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">{row.paymentTerms}</span></td>
                    </tr>
                  ))
                ) : (
                  renderEmptyRow(7)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SUPPLIER REGISTER */}
      {activeRegister === 'suppliers' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Supplier Register</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-5">Supplier ID</th>
                  <th className="py-3.5 px-5">Supplier Name</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5 text-right">Total Purchased</th>
                  <th className="py-3.5 px-5 text-right">Amount Paid</th>
                  <th className="py-3.5 px-5 text-right">Balance Due</th>
                  <th className="py-3.5 px-5">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#FF5500]">{row.supplierId}</td>
                      <td className="py-3.5 px-5 font-bold text-[#0A1931]">{row.name}</td>
                      <td className="py-3.5 px-5"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">{row.category}</span></td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold">{formatMoney(row.totalPurchased)}</td>
                      <td className="py-3.5 px-5 text-right font-mono text-emerald-600 font-bold">{formatMoney(row.paidAmount)}</td>
                      <td className="py-3.5 px-5 text-right font-mono font-black text-rose-500">{formatMoney(row.balanceDue)}</td>
                      <td className="py-3.5 px-5"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">{row.rating}</span></td>
                    </tr>
                  ))
                ) : (
                  renderEmptyRow(7)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. ORDER REGISTER */}
      {activeRegister === 'orders' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Order Register</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-5">Order ID</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Channel</th>
                  <th className="py-3.5 px-5">Payment Mode</th>
                  <th className="py-3.5 px-5 text-right">Amount</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#FF5500]">{row.orderId}</td>
                      <td className="py-3.5 px-5 font-mono text-slate-500">{row.date}</td>
                      <td className="py-3.5 px-5 font-bold text-[#0A1931]">{row.customer}</td>
                      <td className="py-3.5 px-5"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">{row.platform}</span></td>
                      <td className="py-3.5 px-5 text-slate-600">{row.paymentMode}</td>
                      <td className="py-3.5 px-5 text-right font-mono font-black text-[#0A1931]">{formatMoney(row.amount)}</td>
                      <td className="py-3.5 px-5"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">{row.fulfillmentStatus}</span></td>
                    </tr>
                  ))
                ) : (
                  renderEmptyRow(7)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. RETURN REGISTER */}
      {activeRegister === 'returns' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Return Register</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-5">Return ID</th>
                  <th className="py-3.5 px-5">Order Ref</th>
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Product Returned</th>
                  <th className="py-3.5 px-5">Reason</th>
                  <th className="py-3.5 px-5 text-right">Refund Amount</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#FF5500]">{row.returnId}</td>
                      <td className="py-3.5 px-5 font-mono text-[#0A1931]">{row.orderId}</td>
                      <td className="py-3.5 px-5 font-bold text-[#0A1931]">{row.customer}</td>
                      <td className="py-3.5 px-5 text-slate-700">{row.product}</td>
                      <td className="py-3.5 px-5 text-rose-500 font-medium">{row.reason}</td>
                      <td className="py-3.5 px-5 text-right font-mono font-black text-[#0A1931]">{formatMoney(row.refundAmount)}</td>
                      <td className="py-3.5 px-5"><span className="bg-orange-50 text-[#FF5500] border border-orange-200 px-2 py-0.5 rounded-full text-[10px] font-bold">{row.refundStatus}</span></td>
                    </tr>
                  ))
                ) : (
                  renderEmptyRow(7)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. PAYMENT REGISTER */}
      {activeRegister === 'payments' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Payment Register</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-5">Txn ID</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Method / Channel</th>
                  <th className="py-3.5 px-5">Payer / Source</th>
                  <th className="py-3.5 px-5 text-right">Gross Amount</th>
                  <th className="py-3.5 px-5 text-right">Fees</th>
                  <th className="py-3.5 px-5 text-right">Net Settlement</th>
                  <th className="py-3.5 px-5">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#FF5500]">{row.txnId}</td>
                      <td className="py-3.5 px-5 font-mono text-slate-500">{row.date}</td>
                      <td className="py-3.5 px-5"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">{row.method}</span></td>
                      <td className="py-3.5 px-5 font-bold text-[#0A1931]">{row.payer}</td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-[#0A1931]">{formatMoney(row.grossAmount)}</td>
                      <td className="py-3.5 px-5 text-right font-mono text-rose-500">-{formatMoney(row.gatewayFee)}</td>
                      <td className="py-3.5 px-5 text-right font-mono font-black text-emerald-600">{formatMoney(row.netSettlement)}</td>
                      <td className="py-3.5 px-5"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">{row.settlementStatus}</span></td>
                    </tr>
                  ))
                ) : (
                  renderEmptyRow(8)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. DELIVERY REGISTER */}
      {activeRegister === 'deliveries' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Delivery Register</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-5">Dispatch #</th>
                  <th className="py-3.5 px-5">Order #</th>
                  <th className="py-3.5 px-5">Courier Partner</th>
                  <th className="py-3.5 px-5">AWB / Tracking #</th>
                  <th className="py-3.5 px-5">Route</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Freight Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#FF5500]">{row.dispatchId}</td>
                      <td className="py-3.5 px-5 font-mono text-[#0A1931]">{row.orderId}</td>
                      <td className="py-3.5 px-5 font-bold text-[#0A1931]">{row.courier}</td>
                      <td className="py-3.5 px-5 font-mono font-semibold text-blue-600">{row.awb}</td>
                      <td className="py-3.5 px-5 text-slate-600">{row.origin} → {row.destination}</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {row.status || 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-[#0A1931]">{formatMoney(row.shippingCost)}</td>
                    </tr>
                  ))
                ) : (
                  renderEmptyRow(7)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. EXPENSE REGISTER */}
      {activeRegister === 'expenses' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Expense Register</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-5">Expense #</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Title</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Vendor</th>
                  <th className="py-3.5 px-5 text-right">Tax (ITC)</th>
                  <th className="py-3.5 px-5 text-right">Total Outflow</th>
                  <th className="py-3.5 px-5">Payment Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#FF5500]">{row.expenseId}</td>
                      <td className="py-3.5 px-5 font-mono text-slate-500">{row.date}</td>
                      <td className="py-3.5 px-5 font-bold text-[#0A1931]">{row.title}</td>
                      <td className="py-3.5 px-5"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">{row.category}</span></td>
                      <td className="py-3.5 px-5 text-slate-600">{row.vendor}</td>
                      <td className="py-3.5 px-5 text-right font-mono text-slate-500">{formatMoney(row.tax)}</td>
                      <td className="py-3.5 px-5 text-right font-mono font-black text-rose-500">{formatMoney(row.amount)}</td>
                      <td className="py-3.5 px-5"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-600">{row.paymentMode}</span></td>
                    </tr>
                  ))
                ) : (
                  renderEmptyRow(8)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 11. BANK RECONCILIATION */}
      {activeRegister === 'bankReconciliation' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-[#0A1931] text-lg">Bank Reconciliation</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            <div className="space-y-4">
              <div className="bg-[#F8F9FB] p-4 rounded-2xl flex justify-between font-extrabold text-sm text-[#0A1931]">
                <span>Balance as per Bank Book:</span>
                <span className="font-mono text-base text-[#0A1931]">{formatMoney(data?.bankBookBalance || 0)}</span>
              </div>
              <div className="space-y-2 pt-2">
                <span className="font-bold text-emerald-600 uppercase tracking-wider text-[11px]">Add: Uncleared Cheques Issued</span>
                {data?.unclearedCheques && data.unclearedCheques.length > 0 ? (
                  <div className="bg-[#FAFAFB] border border-slate-200 rounded-xl p-3 space-y-1.5">
                    {data.unclearedCheques.map((c: any, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <span>{c.chqNo} ({c.payee})</span>
                        <span className="font-mono font-bold">{formatMoney(c.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-slate-400 bg-[#FAFAFB] border border-slate-100 rounded-xl">No uncleared cheques.</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FFF5EF] border border-[#FFE8DC] p-4 rounded-2xl flex justify-between font-extrabold text-sm text-[#0A1931]">
                <span>Balance as per Bank Statement:</span>
                <span className="font-mono text-base text-[#FF5500]">{formatMoney(data?.bankStatementBalance || 0)}</span>
              </div>
              <div className="space-y-2 pt-2">
                <span className="font-bold text-rose-500 uppercase tracking-wider text-[11px]">Less: Deposits in Transit</span>
                {data?.depositsInTransit && data.depositsInTransit.length > 0 ? (
                  <div className="bg-[#FAFAFB] border border-slate-200 rounded-xl p-3 space-y-1.5">
                    {data.depositsInTransit.map((d: any, idx: number) => (
                      <div key={idx} className="flex justify-between">
                        <span>{d.details}</span>
                        <span className="font-mono font-bold">-{formatMoney(d.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-slate-400 bg-[#FAFAFB] border border-slate-100 rounded-xl">No deposits in transit.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. DAILY CASH BOOK */}
      {activeRegister === 'cashBook' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Daily Cash Book</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5 text-right">Opening Cash</th>
                  <th className="py-3.5 px-5">Receipt Details</th>
                  <th className="py-3.5 px-5">Payment Details</th>
                  <th className="py-3.5 px-5 text-right">Closing Cash in Hand</th>
                  <th className="py-3.5 px-5">Verified By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3.5 px-5 font-mono font-bold text-[#0A1931]">{row.date}</td>
                      <td className="py-3.5 px-5 text-right font-mono">{formatMoney(row.openingCash)}</td>
                      <td className="py-3.5 px-5">
                        {row.receipts && row.receipts.length > 0 ? (
                          row.receipts.map((r: any, idx: number) => (
                            <div key={idx} className="text-emerald-700 font-medium">
                              +{formatMoney(r.amount)} ({r.desc})
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        {row.payments && row.payments.length > 0 ? (
                          row.payments.map((p: any, idx: number) => (
                            <div key={idx} className="text-rose-600 font-medium">
                              -{formatMoney(p.amount)} ({p.desc})
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-black text-sm text-[#FF5500]">
                        {formatMoney(row.closingCash)}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">{row.verifier}</td>
                    </tr>
                  ))
                ) : (
                  renderEmptyRow(6)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
