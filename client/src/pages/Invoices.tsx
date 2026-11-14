import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Trash2,
  Download,
  CreditCard,
  X,
  FileText,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { request } from '../services/api';
import { Invoice, InvoiceItem } from '../types';

export const Invoices: React.FC = () => {
  const { user } = useAuth();
  const { formatMoney } = useCurrency();
  const [searchParams] = useSearchParams();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);

  // New Invoice Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [platform, setPlatform] = useState<'Shopify' | 'WooCommerce' | 'Amazon' | 'Direct Website' | 'Custom / Manual'>('Direct Website');
  const [orderReference, setOrderReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [taxRate, setTaxRate] = useState<number>(18);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { sku: '', description: '', quantity: 1, unitPrice: 0, amount: 0 },
  ]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await request<{ success: boolean; data: Invoice[] }>(
        `/invoices?status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`
      );
      if (res.success && res.data) {
        setInvoices(res.data);
      }
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    if (searchParams.get('action') === 'new') {
      setShowModal(true);
    }
  }, [statusFilter, searchTerm]);

  // Line Items Handler
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) : updated[index].quantity;
      const p = field === 'unitPrice' ? Number(value) : updated[index].unitPrice;
      updated[index].amount = q * p;
    }
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([...items, { sku: '', description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const subtotal = items.reduce((acc, it) => acc + (it.amount || 0), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = Math.max(0, subtotal + taxAmount + shippingFee - discount);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) {
      alert('Please enter a customer name');
      return;
    }

    try {
      await request('/invoices', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          platform,
          orderReference,
          items,
          taxRate,
          shippingFee,
          discount,
          paymentMethod,
          notes,
          status: 'pending',
        }),
      });
      setShowModal(false);
      fetchInvoices();
      setCustomerName('');
      setCustomerEmail('');
      setOrderReference('');
      setItems([{ sku: '', description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
    } catch (err: any) {
      alert(err.message || 'Error creating invoice');
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentModalInvoice) return;
    try {
      await request(`/invoices/${paymentModalInvoice._id}/payment`, {
        method: 'PUT',
        body: JSON.stringify({ amountPaid: payAmount }),
      });
      setPaymentModalInvoice(null);
      fetchInvoices();
    } catch (err: any) {
      alert(err.message || 'Error recording payment');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice? This will be audited.')) {
      try {
        await request(`/invoices/${id}`, { method: 'DELETE' });
        fetchInvoices();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0A1931] tracking-tight">
            Invoices
          </h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold text-sm px-6 py-3 rounded-full shadow-lg shadow-orange-500/20 active:scale-[0.98] transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Invoice</span>
        </button>
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

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['all', 'paid', 'partially_paid', 'pending', 'overdue'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-[#FF5500] text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FB] text-slate-500 uppercase font-bold tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-4 px-6">Invoice #</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Platform</th>
                <th className="py-4 px-6">Issue Date</th>
                <th className="py-4 px-6 text-right">Total Amount</th>
                <th className="py-4 px-6 text-right">Paid / Balance</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400 text-sm">
                    No invoices found matching criteria.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-[#FFFBF8] transition">
                    <td className="py-4 px-6 font-mono font-bold text-[#FF5500]">
                      <Link to={`/invoices/${inv._id}`} className="hover:underline flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-slate-400" />
                        <span>{inv.invoiceNumber}</span>
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#0F172A]">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{inv.customerEmail || 'No email'}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[10px] font-semibold border border-slate-200">
                        {inv.platform}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-black text-[#0F172A] text-sm">
                      {formatMoney(inv.totalAmount)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="text-emerald-600 font-bold font-mono">{formatMoney(inv.amountPaid)} paid</div>
                      {inv.balanceDue > 0 && (
                        <div className="text-rose-500 text-[10px] font-bold font-mono">{formatMoney(inv.balanceDue)} due</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'partially_paid'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/invoices/${inv._id}`}
                          title="View & Print"
                          className="p-2 text-slate-400 hover:text-[#FF5500] hover:bg-orange-50 rounded-xl transition"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => {
                              setPaymentModalInvoice(inv);
                              setPayAmount(inv.balanceDue);
                            }}
                            title="Record Payment"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(inv._id)}
                          title="Delete Invoice"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal - Pure White Quicount Card */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-3xl my-8 p-6 sm:p-8 shadow-2xl space-y-6 text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-[#0A1931]">New Invoice</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-6">
              {/* Customer details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Company *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Store / Sales Platform</label>
                  <select
                    value={platform}
                    onChange={(e: any) => setPlatform(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  >
                    <option value="Direct Website">Direct Website</option>
                    <option value="Shopify">Shopify Store</option>
                    <option value="WooCommerce">WooCommerce</option>
                    <option value="Amazon">Amazon Marketplace</option>
                    <option value="Custom / Manual">Custom / Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Order / Tracking Ref</label>
                  <input
                    type="text"
                    value={orderReference}
                    onChange={(e) => setOrderReference(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-extrabold text-[#0A1931] uppercase tracking-wider">
                    Line Items & Products
                  </label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-[#FF5500] hover:text-[#E04B00] font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add Item Row
                  </button>
                </div>

                <div className="space-y-2.5">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#FAFAFB] p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        value={item.sku}
                        onChange={(e) => handleItemChange(idx, 'sku', e.target.value)}
                        className="w-24 bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800"
                      />
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800"
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-16 bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 text-center"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-28 bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 text-right"
                      />
                      <div className="w-28 text-right font-mono font-bold text-xs text-[#0A1931] pr-2">
                        {formatMoney(item.amount || 0)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax, Shipping, Discount & Totals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-slate-100">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                    >
                      <option value="Stripe">Stripe Merchant</option>
                      <option value="Razorpay">Razorpay / UPI</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Bank Transfer">Direct Wire / NEFT / RTGS</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Terms</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="bg-[#FFF5EF] border border-[#FFE8DC] p-5 rounded-2xl space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold text-[#0A1931]">{formatMoney(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>GST Rate (%):</span>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-20 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-right font-mono text-slate-800"
                    />
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Shipping Freight:</span>
                    <input
                      type="number"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(Number(e.target.value))}
                      className="w-24 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-right font-mono text-slate-800"
                    />
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Discount:</span>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-24 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-right font-mono text-slate-800"
                    />
                  </div>
                  <div className="border-t border-[#FFE0D0] pt-3 flex justify-between text-base font-extrabold text-[#0A1931]">
                    <span>Total Amount:</span>
                    <span className="text-[#FF5500] font-mono">{formatMoney(totalAmount)}</span>
                  </div>
                </div>
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
                  Save & Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-4 text-slate-800">
            <h3 className="text-lg font-extrabold text-[#0A1931]">
              Record Payment on {paymentModalInvoice.invoiceNumber}
            </h3>
            <p className="text-xs text-slate-500">
              Customer: <strong className="text-[#0A1931]">{paymentModalInvoice.customerName}</strong>
              <br />
              Remaining Balance Due:{' '}
              <strong className="text-rose-500 font-mono font-bold">{formatMoney(paymentModalInvoice.balanceDue)}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount to Record</label>
              <input
                type="number"
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-[#FF5500]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setPaymentModalInvoice(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                className="bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md shadow-orange-500/20 transition"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
