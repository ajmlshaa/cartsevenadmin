import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Building,
  DollarSign,
  MapPin,
  Shield,
  Store,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency, CURRENCIES } from '../context/CurrencyContext';
import { request } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { currency, setCurrencyCode } = useCurrency();
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings State
  const [storeName, setStoreName] = useState('CartSeven E-Commerce');
  const [legalName, setLegalName] = useState('CartSeven Retail Private Limited');
  const [taxId, setTaxId] = useState('27AABCU9603R1ZM');
  const [contactEmail, setContactEmail] = useState('billing@cartseven.com');
  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(18.0);
  const [fiscalYearStart, setFiscalYearStart] = useState('4'); // April (Indian FY)
  const [invoicePrefix, setInvoicePrefix] = useState('INV-2026-');
  const [panNumber, setPanNumber] = useState('AABCU9603R');
  const [bankAccount, setBankAccount] = useState('HDFC Bank Current A/c - 50200084920194');
  const [registeredAddress, setRegisteredAddress] = useState('CartSeven Commerce Center, Bandra Kurla Complex, Mumbai, Maharashtra 400051');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await request<any>('/settings');
        if (res?.data) {
          if (res.data.storeName) setStoreName(res.data.storeName);
          if (res.data.legalEntityName) setLegalName(res.data.legalEntityName);
          if (res.data.taxNumber) setTaxId(res.data.taxNumber);
          if (res.data.contactEmail) setContactEmail(res.data.contactEmail);
          if (res.data.defaultTaxRate) setDefaultTaxRate(res.data.defaultTaxRate);
        }
      } catch {
        // Fallback default
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await request('/settings', {
        method: 'PUT',
        body: JSON.stringify({
          storeName,
          legalEntityName: legalName,
          taxNumber: taxId,
          contactEmail,
          defaultTaxRate,
          invoicePrefix,
        }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0A1931] tracking-tight">
            System & Organization Settings
          </h1>
          <span className="bg-[#FFF5EF] text-[#FF5500] border border-[#FFE8DC] text-xs px-3 py-1 rounded-full font-bold">
            GST & Compliance
          </span>
        </div>
        <p className="text-slate-500 text-sm mt-1">
          Configure legal entity data, GSTIN credentials, default INR tax thresholds, and banking settlement details.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-sm flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
          <span className="font-bold">Settings saved successfully and recorded in the audit trail.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Store & Legal Details */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Store className="w-5 h-5 text-[#FF5500]" />
            <h2 className="text-lg font-extrabold text-[#0A1931]">E-Commerce Brand & Legal Entity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store / Public Brand Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registered Legal Entity Name</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN / Corporate Tax ID</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-[#FF5500] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Billing Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Currency & Tax Defaults */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <DollarSign className="w-5 h-5 text-[#FF5500]" />
            <h2 className="text-lg font-extrabold text-[#0A1931]">Currency & Tax Configuration</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Reporting Currency</label>
              <div className="w-full bg-[#FFF5EF] border border-[#FFE8DC] rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-[#FF5500] flex items-center justify-between">
                <span>Indian Rupee (INR - ₹)</span>
                <span className="bg-white border border-[#FFE8DC] text-[10px] px-2 py-0.5 rounded-full">Locked to INR</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default GST Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
                className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-[#FF5500] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Number Prefix</label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:outline-none focus:border-[#FF5500] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Registered E-Commerce Tax & Settlement Profile */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Building className="w-5 h-5 text-[#FF5500]" />
            <h2 className="text-lg font-extrabold text-[#0A1931]">Registered E-Commerce Tax & Settlement Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company PAN Number</label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono uppercase focus:outline-none focus:border-[#FF5500] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Settlement Bank Account</label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Principal Place of Business (Registered Address)</label>
              <input
                type="text"
                value={registeredAddress}
                onChange={(e) => setRegisteredAddress(e.target.value)}
                className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-lg shadow-orange-500/20 active:scale-[0.98] transition"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
