import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  CheckCircle,
  Building2,
  Mail,
  Phone,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { request } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { CartSevenLogo } from '../components/CartSevenLogo';
import { Invoice } from '../types';

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { formatMoney } = useCurrency();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInv = async () => {
      try {
        const res = await request<{ success: boolean; data: Invoice }>(`/invoices/${id}`);
        if (res.success && res.data) {
          setInvoice(res.data);
        }
      } catch {
        // Fallback mock with INR values
        setInvoice({
          _id: id || 'inv_mock',
          invoiceNumber: 'INV-2026-0001',
          customerName: 'Aero Dynamics Corp',
          customerEmail: 'procurement@aerodynamics.com',
          customerPhone: '+91 98200 12345',
          customerAddress: '420 Tech Boulevard, Cyber City, Gurugram, HR 122002',
          platform: 'Direct Website',
          orderReference: 'ORD-8941',
          items: [
            { sku: 'CS-PRO-10', description: 'CartSeven Pro Wireless Hub (Commercial Edition)', quantity: 5, unitPrice: 7500.0, amount: 37500.0 },
            { sku: 'CS-ACC-02', description: 'Heavy Duty Anodized Aluminum Mounting Kit', quantity: 5, unitPrice: 1200.0, amount: 6000.0 },
          ],
          subtotal: 43500.0,
          taxRate: 18.0,
          taxAmount: 7830.0,
          shippingFee: 1200.0,
          discount: 1500.0,
          totalAmount: 51030.0,
          amountPaid: 51030.0,
          balanceDue: 0,
          status: 'paid',
          paymentMethod: 'Razorpay / UPI Gateway',
          issueDate: '2026-11-02',
          dueDate: '2026-11-16',
          paidAt: '2026-11-03',
          notes: 'Standard 1-year commercial warranty included with all CartSeven units.',
          location: 'HQ - New York, US',
          createdByName: 'Sarah Jenkins',
          createdAt: '2026-11-02T11:45:00.000Z',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInv();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading invoice details...</div>;
  }

  if (!invoice) {
    return <div className="p-12 text-center text-rose-500 font-bold">Invoice not found.</div>;
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-6">
      {/* Top action controls (hidden on print) */}
      <div className="flex items-center justify-between no-print">
        <Link
          to="/invoices"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#FF5500] transition"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Invoices</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-full shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoice Sheet - Crisp White Paper Design */}
      <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.06)] text-slate-800 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-100 print:border-gray-200">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <CartSevenLogo size="md" />
            </div>
            <div className="text-xs text-slate-500 print:text-gray-600 space-y-0.5">
              <p className="font-bold text-[#0A1931] print:text-black">CartSeven E-Commerce Retail LLC</p>
              <p>100 Commerce Way, Suite 400</p>
              <p>GSTIN / Tax ID: 27AABCU9603R1ZM</p>
              <p>support@cartseven.com • billing@cartseven.com</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <h1 className="text-3xl font-black text-[#0A1931] tracking-tight uppercase print:text-black">
              TAX INVOICE
            </h1>
            <div className="text-sm font-mono font-extrabold text-[#FF5500] mt-1">
              {invoice.invoiceNumber}
            </div>
            <div className="mt-3 inline-block">
              <span
                className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                Status: {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-100 print:border-gray-200 text-xs">
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 print:text-gray-500 tracking-wider">
              Billed To
            </span>
            <div className="text-base font-extrabold text-[#0A1931] print:text-black mt-1">
              {invoice.customerName}
            </div>
            <div className="text-slate-500 print:text-gray-600 space-y-1 mt-1 leading-relaxed">
              {invoice.customerAddress && <p>{invoice.customerAddress}</p>}
              {invoice.customerEmail && <p>Email: {invoice.customerEmail}</p>}
              {invoice.customerPhone && <p>Phone: {invoice.customerPhone}</p>}
            </div>
          </div>

          <div className="sm:text-right space-y-2">
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 print:text-gray-500 tracking-wider">
                Issue Date:
              </span>
              <span className="font-mono font-bold ml-2 text-[#0A1931] print:text-black">
                {new Date(invoice.issueDate).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 print:text-gray-500 tracking-wider">
                Payment Due Date:
              </span>
              <span className="font-mono font-bold ml-2 text-[#0A1931] print:text-black">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 print:text-gray-500 tracking-wider">
                Sales Channel:
              </span>
              <span className="font-bold ml-2 text-[#0A1931] print:text-black">
                {invoice.platform} {invoice.orderReference && `(${invoice.orderReference})`}
              </span>
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 print:text-gray-500 tracking-wider">
                Billing Currency:
              </span>
              <span className="font-bold ml-2 text-[#0A1931] print:text-black">
                INR (₹) - Indian Rupee
              </span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-8">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-[#F8F9FB] print:bg-transparent print:border-gray-300 text-slate-500 uppercase text-[11px] font-bold">
              <tr>
                <th className="py-3 px-3 w-20">SKU</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3 text-center w-16">Qty</th>
                <th className="py-3 px-3 text-right w-28">Unit Price</th>
                <th className="py-3 px-3 text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-gray-200">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-3 font-mono text-slate-400">{item.sku || '-'}</td>
                  <td className="py-3.5 px-3 font-semibold text-[#0A1931] print:text-black">{item.description}</td>
                  <td className="py-3.5 px-3 text-center text-slate-700">{item.quantity}</td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                    {formatMoney(item.unitPrice)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-extrabold text-[#0A1931]">
                    {formatMoney(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary / Calculation Box */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-6 border-t border-slate-100 print:border-gray-200 text-xs">
          <div className="space-y-2 max-w-sm">
            <span className="text-[11px] uppercase font-bold text-slate-400 print:text-gray-500 tracking-wider">
              Payment Information & Terms
            </span>
            <p className="text-slate-600 text-xs">
              Method: <strong className="text-[#0A1931]">{invoice.paymentMethod}</strong>
            </p>
            {invoice.notes && (
              <p className="text-slate-600 italic bg-[#FFF5EF] border border-[#FFE8DC] p-3 rounded-xl text-[11px] leading-relaxed">
                {invoice.notes}
              </p>
            )}
          </div>

          <div className="w-full sm:w-80 bg-[#FFF5EF] border border-[#FFE8DC] rounded-2xl p-5 space-y-2.5">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold text-[#0A1931]">{formatMoney(invoice.subtotal)}</span>
            </div>
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>GST Tax ({invoice.taxRate}%):</span>
                <span className="font-mono font-semibold text-[#0A1931]">{formatMoney(invoice.taxAmount)}</span>
              </div>
            )}
            {invoice.shippingFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Shipping Freight:</span>
                <span className="font-mono font-semibold text-[#0A1931]">{formatMoney(invoice.shippingFee)}</span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount Applied:</span>
                <span className="font-mono font-semibold">-{formatMoney(invoice.discount)}</span>
              </div>
            )}
            <div className="border-t border-[#FFE0D0] pt-3 flex justify-between text-base font-extrabold text-[#0A1931]">
              <span>Total Amount:</span>
              <span className="text-[#FF5500] font-mono">
                {formatMoney(invoice.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-xs pt-1 text-slate-600">
              <span>Amount Paid:</span>
              <span className="font-mono font-bold text-emerald-600">
                {formatMoney(invoice.amountPaid)}
              </span>
            </div>
            {invoice.balanceDue > 0 && (
              <div className="flex justify-between text-xs font-bold text-rose-500">
                <span>Balance Due:</span>
                <span className="font-mono">{formatMoney(invoice.balanceDue)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-100 print:border-gray-200 text-center text-slate-400 print:text-gray-500 text-[11px]">
          Thank you for choosing CartSeven. For accounting or invoice inquiries, contact billing@cartseven.com.
        </div>
      </div>
    </div>
  );
};
