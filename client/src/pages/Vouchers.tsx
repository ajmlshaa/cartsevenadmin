import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Printer,
  Trash2,
  CheckCircle,
  CreditCard,
  Building2,
  Calendar,
  Layers,
  ArrowRightLeft,
  X,
  Eye,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Keyboard,
  Check,
  CornerDownLeft,
  Command,
  HelpCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { request } from '../services/api';
import { Voucher, VoucherType, CollectionMethod } from '../types';
import { SPECIAL_ECOMMERCE_ACCOUNTS, ESSENTIAL_LEDGER_GROUPS } from './ChartOfAccounts';

export const VOUCHER_TYPES: { type: VoucherType; desc: string; example: string }[] = [
  { type: 'Payment Voucher', desc: 'Money paid out', example: 'Supplier payment, advertising' },
  { type: 'Receipt Voucher', desc: 'Money received', example: 'Customer payment, capital introduced' },
  { type: 'Sales Voucher', desc: 'Products sold', example: 'Online customer order' },
  { type: 'Purchase Voucher', desc: 'Products purchased', example: 'Buying stock from supplier' },
  { type: 'Contra Voucher', desc: 'Cash/bank transfers', example: 'Bank to cash, Cash to bank' },
  { type: 'Journal Voucher', desc: 'Adjustment entries', example: 'Depreciation, corrections' },
  { type: 'Credit Note', desc: 'Sales return / refund', example: 'Customer returns product' },
  { type: 'Debit Note', desc: 'Purchase return', example: 'Returning damaged stock to supplier' },
];

export const COLLECTION_METHODS: CollectionMethod[] = [
  'Cash on Delivery (COD)',
  'Online Payment Gateway (Razorpay/Stripe)',
  'Marketplace Clearing (Amazon/Flipkart)',
  'Direct Bank Transfer (NEFT/RTGS)',
  'Cash in Hand',
  'Credit / Journal Adjustment',
];

export interface MasterLedger {
  code: string;
  name: string;
  groupTitle: string;
  subType: string;
  type: string;
  balance: number;
}

// Unified Ledger Master with 40+ E-Commerce & Essential Accounts
export const ALL_LEDGER_ACCOUNTS: MasterLedger[] = (() => {
  const map = new Map<string, MasterLedger>();

  ESSENTIAL_LEDGER_GROUPS.forEach((g) => {
    g.accounts.forEach((a) => {
      map.set(a.name.toLowerCase(), {
        code: a.code,
        name: a.name,
        groupTitle: g.groupTitle,
        subType: a.subType,
        type: a.type,
        balance: a.balance,
      });
    });
  });

  SPECIAL_ECOMMERCE_ACCOUNTS.forEach((a) => {
    if (!map.has(a.name.toLowerCase())) {
      map.set(a.name.toLowerCase(), {
        code: a.code,
        name: a.name,
        groupTitle: 'Special E-Commerce Accounts',
        subType: a.subType,
        type: a.type,
        balance: a.balance,
      });
    }
  });

  return Array.from(map.values());
})();

export const VOUCHER_CONFIGS: Record<
  VoucherType,
  {
    shortcut: string;
    numKey: string;
    prefix: string;
    desc: string;
    example: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    defaultDebit: string;
    defaultCredit: string;
    defaultMethod: CollectionMethod;
    defaultNarration: string;
    debitLabel: string;
    creditLabel: string;
  }
> = {
  'Contra Voucher': {
    shortcut: 'F4',
    numKey: '1',
    prefix: 'CV',
    desc: 'Cash/bank transfers',
    example: 'Bank to cash, Cash to bank',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    defaultDebit: 'Cash in Hand (Petty Cash Float)',
    defaultCredit: 'Bank Account (HDFC Current Account)',
    defaultMethod: 'Cash in Hand',
    defaultNarration: 'Being cash withdrawn from HDFC Current Account for store petty cash float.',
    debitLabel: 'Debit Account (Dr - Receiving Account)',
    creditLabel: 'Credit Account (Cr - Paying Account)',
  },
  'Payment Voucher': {
    shortcut: 'F5',
    numKey: '2',
    prefix: 'PV',
    desc: 'Money paid out',
    example: 'Supplier payment, advertising',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    defaultDebit: 'Supplier Payable',
    defaultCredit: 'Bank Account (HDFC Current Account)',
    defaultMethod: 'Direct Bank Transfer (NEFT/RTGS)',
    defaultNarration: 'Being payment made towards supplier invoice.',
    debitLabel: 'Debit Account (Dr - Expense / Supplier)',
    creditLabel: 'Credit Account (Cr - Bank / Cash)',
  },
  'Receipt Voucher': {
    shortcut: 'F6',
    numKey: '3',
    prefix: 'RV',
    desc: 'Money received',
    example: 'Customer payment, capital introduced',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    defaultDebit: 'Bank Account (HDFC Current Account)',
    defaultCredit: 'Accounts Receivable (Customers)',
    defaultMethod: 'Direct Bank Transfer (NEFT/RTGS)',
    defaultNarration: 'Being payment received from customer against sales order.',
    debitLabel: 'Debit Account (Dr - Bank / Cash Received)',
    creditLabel: 'Credit Account (Cr - Customer / Income)',
  },
  'Journal Voucher': {
    shortcut: 'F7',
    numKey: '4',
    prefix: 'JV',
    desc: 'Adjustment entries',
    example: 'Depreciation, corrections',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    defaultDebit: 'Depreciation Expense Account',
    defaultCredit: 'Computer and Equipment',
    defaultMethod: 'Credit / Journal Adjustment',
    defaultNarration: 'Being monthly adjustment entry passed for fixed asset depreciation.',
    debitLabel: 'Debit Account (Dr - Adjustment Ledger)',
    creditLabel: 'Credit Account (Cr - Offset Ledger)',
  },
  'Sales Voucher': {
    shortcut: 'F8',
    numKey: '5',
    prefix: 'SV',
    desc: 'Products sold',
    example: 'Online customer order',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    defaultDebit: 'Payment Gateway Clearing',
    defaultCredit: 'Product Sales Account',
    defaultMethod: 'Online Payment Gateway (Razorpay/Stripe)',
    defaultNarration: 'Being online merchandise order dispatched to customer.',
    debitLabel: 'Debit Account (Dr - Gateway / COD / Customer)',
    creditLabel: 'Credit Account (Cr - Product Sales Account)',
  },
  'Purchase Voucher': {
    shortcut: 'F9',
    numKey: '6',
    prefix: 'PUV',
    desc: 'Products purchased',
    example: 'Buying stock from supplier',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    defaultDebit: 'Purchase Account',
    defaultCredit: 'Supplier Payable',
    defaultMethod: 'Credit / Journal Adjustment',
    defaultNarration: 'Being inventory stock purchased from merchandise supplier.',
    debitLabel: 'Debit Account (Dr - Stock / Purchase Inward)',
    creditLabel: 'Credit Account (Cr - Supplier Payable)',
  },
  'Credit Note': {
    shortcut: 'Alt+F8',
    numKey: '7',
    prefix: 'CN',
    desc: 'Sales return / refund',
    example: 'Customer returns product',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-[#FF5500]',
    badgeBorder: 'border-orange-200',
    defaultDebit: 'Sales Return Account',
    defaultCredit: 'Customer Refund Payable (E-Commerce)',
    defaultMethod: 'Online Payment Gateway (Razorpay/Stripe)',
    defaultNarration: 'Being credit note issued for customer order return and refund.',
    debitLabel: 'Debit Account (Dr - Sales Return Account)',
    creditLabel: 'Credit Account (Cr - Customer / Refund Payable)',
  },
  'Debit Note': {
    shortcut: 'Alt+F9',
    numKey: '8',
    prefix: 'DN',
    desc: 'Purchase return',
    example: 'Returning damaged stock to supplier',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',
    defaultDebit: 'Supplier Payable',
    defaultCredit: 'Purchase Return Account',
    defaultMethod: 'Credit / Journal Adjustment',
    defaultNarration: 'Being debit note issued to supplier for damaged units returned.',
    debitLabel: 'Debit Account (Dr - Supplier Payable)',
    creditLabel: 'Credit Account (Cr - Purchase Return Account)',
  },
};

export const Vouchers: React.FC = () => {
  const { user } = useAuth();
  const { formatMoney } = useCurrency();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [liveAccounts, setLiveAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewingVoucher, setViewingVoucher] = useState<Voucher | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Voucher Entry State
  const [vType, setVType] = useState<VoucherType>('Receipt Voucher');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [debitAccount, setDebitAccount] = useState('Bank Account - HDFC Current');
  const [creditAccount, setCreditAccount] = useState('AJMALSHA Capital Account');
  const [amount, setAmount] = useState<number | ''>('');
  const [collectionMethod, setCollectionMethod] = useState<CollectionMethod>('Direct Bank Transfer (NEFT/RTGS)');
  const [partyName, setPartyName] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [narration, setNarration] = useState('');

  // Voucher Form State
  const [showDebitDropdown, setShowDebitDropdown] = useState(false);
  const [showCreditDropdown, setShowCreditDropdown] = useState(false);
  const [debitSelectedIndex, setDebitSelectedIndex] = useState(0);
  const [creditSelectedIndex, setCreditSelectedIndex] = useState(0);
  const [showAcceptPrompt, setShowAcceptPrompt] = useState(false);
  const [saving, setSaving] = useState(false);

  // Field Refs for sequential keyboard progression
  const dateInputRef = useRef<HTMLInputElement>(null);
  const debitInputRef = useRef<HTMLInputElement>(null);
  const creditInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const partyInputRef = useRef<HTMLInputElement>(null);
  const narrationInputRef = useRef<HTMLInputElement>(null);
  const acceptYesBtnRef = useRef<HTMLButtonElement>(null);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await request<{ success: boolean; data: Voucher[] }>(
        `/vouchers?type=${selectedType}&collectionMethod=${selectedMethod}&search=${encodeURIComponent(searchTerm)}`
      );
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
  }, [selectedType, selectedMethod, searchTerm]);

  // Switch voucher type
  const handleSelectVoucherType = (type: VoucherType) => {
    setVType(type);
    const cfg = VOUCHER_CONFIGS[type];
    if (cfg) {
      setCollectionMethod(cfg.defaultMethod);
      if (type === 'Receipt Voucher') {
        setDebitAccount('Bank Account - HDFC Current');
        setCreditAccount('AJMALSHA Capital Account');
        setNarration('Receipt deposited into HDFC Current Account');
      } else if (type === 'Payment Voucher') {
        setDebitAccount('Supplier Payable');
        setCreditAccount('Bank Account - HDFC Current');
        setNarration('Payment issued from HDFC Current Account');
      } else if (type === 'Contra Voucher') {
        setDebitAccount('Bank Account - HDFC Current');
        setCreditAccount('Cash in Hand');
        setNarration('Cash in hand deposited into HDFC Current Account');
      } else if (type === 'Purchase Voucher') {
        setDebitAccount('Purchase Account');
        setCreditAccount('Supplier Payable');
        setNarration('Merchandise stock purchase');
      } else if (type === 'Sales Voucher') {
        setDebitAccount('Payment Gateway Clearing');
        setCreditAccount('Product Sales Account');
        setNarration('E-commerce sales order');
      }
    }
  };

  // Quick Preset Handlers
  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'capital_ajmalsha':
        setVType('Receipt Voucher');
        setCollectionMethod('Direct Bank Transfer (NEFT/RTGS)');
        setDebitAccount('Bank Account - HDFC Current');
        setCreditAccount('AJMALSHA Capital Account');
        setPartyName('AJMALSHA');
        setNarration('Initial partner capital deposit into HDFC Current Account');
        break;
      case 'capital_ashique':
        setVType('Receipt Voucher');
        setCollectionMethod('Direct Bank Transfer (NEFT/RTGS)');
        setDebitAccount('Bank Account - HDFC Current');
        setCreditAccount('ASHIQUE SALIM Capital Account');
        setPartyName('ASHIQUE SALIM');
        setNarration('Partner capital deposit into HDFC Current Account');
        break;
      case 'capital_shanu':
        setVType('Receipt Voucher');
        setCollectionMethod('Direct Bank Transfer (NEFT/RTGS)');
        setDebitAccount('Bank Account - HDFC Current');
        setCreditAccount('SHANU Capital Account');
        setPartyName('SHANU');
        setNarration('Partner capital deposit into HDFC Current Account');
        break;
      case 'drawings_ajmalsha':
        setVType('Payment Voucher');
        setCollectionMethod('Direct Bank Transfer (NEFT/RTGS)');
        setDebitAccount('AJMALSHA Drawings Account');
        setCreditAccount('Bank Account - HDFC Current');
        setPartyName('AJMALSHA');
        setNarration('Partner profit drawings withdrawal from HDFC Bank');
        break;
      case 'drawings_ashique':
        setVType('Payment Voucher');
        setCollectionMethod('Direct Bank Transfer (NEFT/RTGS)');
        setDebitAccount('ASHIQUE SALIM Drawings Account');
        setCreditAccount('Bank Account - HDFC Current');
        setPartyName('ASHIQUE SALIM');
        setNarration('Partner profit drawings withdrawal from HDFC Bank');
        break;
      case 'drawings_shanu':
        setVType('Payment Voucher');
        setCollectionMethod('Direct Bank Transfer (NEFT/RTGS)');
        setDebitAccount('SHANU Drawings Account');
        setCreditAccount('Bank Account - HDFC Current');
        setPartyName('SHANU');
        setNarration('Partner profit drawings withdrawal from HDFC Bank');
        break;
      case 'inventory':
        setVType('Purchase Voucher');
        setCollectionMethod('Credit / Journal Adjustment');
        setDebitAccount('Purchase Account');
        setCreditAccount('Supplier Payable');
        setPartyName('Merchandise Supplier');
        setNarration('Purchase of merchandise inventory');
        break;
      case 'ads':
        setVType('Payment Voucher');
        setCollectionMethod('Online Payment Gateway (Razorpay/Stripe)');
        setDebitAccount('Advertising and Marketing');
        setCreditAccount('Bank Account - HDFC Current');
        setPartyName('Meta Platforms Inc / Google Ads');
        setNarration('Customer acquisition digital ad spend');
        break;
      case 'courier':
        setVType('Payment Voucher');
        setCollectionMethod('Online Payment Gateway (Razorpay/Stripe)');
        setDebitAccount('Shipping and Delivery Charges (Outward)');
        setCreditAccount('Bank Account - HDFC Current');
        setPartyName('Delhivery / Blue Dart Courier');
        setNarration('Freight delivery logistics charges');
        break;
      case 'contra_deposit':
        setVType('Contra Voucher');
        setCollectionMethod('Cash in Hand');
        setDebitAccount('Bank Account - HDFC Current');
        setCreditAccount('Cash in Hand');
        setPartyName('Cash Deposit');
        setNarration('Cash in hand deposited into HDFC Current Account');
        break;
    }
    setTimeout(() => {
      amountInputRef.current?.focus();
    }, 50);
  };

  // Switch to voucher mode and open modal
  const openVoucherCreation = (type?: VoucherType) => {
    if (type) {
      handleSelectVoucherType(type);
    } else {
      handleSelectVoucherType('Receipt Voucher');
    }
    setAmount('');
    setPartyName('');
    setShowModal(true);
    setShowAcceptPrompt(false);
    setTimeout(() => {
      partyInputRef.current?.focus();
    }, 100);
  };

  // Helper to find balance for an account (reading real-time live balances)
  const getAccountBalanceDisplay = (ledgerName: string) => {
    const trimmed = ledgerName.trim().toLowerCase();
    if (!trimmed) return null;
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const qNorm = norm(trimmed);
    const ledger =
      liveAccounts.find(
        (a) =>
          norm(a.name) === qNorm ||
          norm(a.code) === qNorm ||
          norm(a.name).includes(qNorm) ||
          qNorm.includes(norm(a.name))
      ) ||
      ALL_LEDGER_ACCOUNTS.find(
        (l) =>
          norm(l.name) === qNorm ||
          norm(l.code) === qNorm ||
          norm(l.name).includes(qNorm) ||
          qNorm.includes(norm(l.name))
      );
    if (!ledger) return null;
    const bal = Number(ledger.balance) || 0;
    const isDebit = ['Asset', 'Expense'].includes(ledger.type) ? bal >= 0 : bal < 0;
    return {
      formatted: `${formatMoney(Math.abs(bal))} ${isDebit ? 'Dr' : 'Cr'}`,
      isDebit,
      group: ledger.subType || ledger.groupTitle || ledger.type,
      code: ledger.code,
    };
  };

  // Filtered ledgers for autocomplete dropdowns
  const filteredDebitLedgers = useMemo(() => {
    const q = debitAccount.toLowerCase().trim();
    if (!q) return ALL_LEDGER_ACCOUNTS.slice(0, 10);
    return ALL_LEDGER_ACCOUNTS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        l.groupTitle.toLowerCase().includes(q) ||
        l.subType.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [debitAccount]);

  const filteredCreditLedgers = useMemo(() => {
    const q = creditAccount.toLowerCase().trim();
    if (!q) return ALL_LEDGER_ACCOUNTS.slice(0, 10);
    return ALL_LEDGER_ACCOUNTS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        l.groupTitle.toLowerCase().includes(q) ||
        l.subType.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [creditAccount]);

  // Save / Post Voucher
  const handleSaveVoucher = async () => {
    if (!partyName.trim()) {
      setShowAcceptPrompt(false);
      partyInputRef.current?.focus();
      alert('Please enter a Party / Vendor / Customer Name.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setShowAcceptPrompt(false);
      amountInputRef.current?.focus();
      alert('Please enter a valid Amount greater than ₹ 0.');
      return;
    }

    setSaving(true);
    try {
      const res = await request<{ success: boolean; data: Voucher }>('/vouchers', {
        method: 'POST',
        body: JSON.stringify({
          type: vType,
          date,
          debitAccount,
          creditAccount,
          amount: Number(amount),
          collectionMethod,
          partyName: partyName.trim(),
          referenceNumber: referenceNumber.trim(),
          narration: narration.trim(),
        }),
      });

      const postedVoucherNo = res.data?.voucherNumber || `${VOUCHER_CONFIGS[vType].prefix}-2026-POSTED`;
      setToastMessage(`✓ Voucher ${postedVoucherNo} accepted & posted! (${formatMoney(Number(amount))})`);
      setTimeout(() => setToastMessage(null), 4500);

      // Refresh list & live ledger balances
      fetchVouchers();
      fetchAccounts();

      // Reset for consecutive rapid entry
      setShowAcceptPrompt(false);
      setPartyName('');
      setAmount('');
      setReferenceNumber('');
      setNarration('');

      // Focus back to Date for continuous entry
      setTimeout(() => {
        dateInputRef.current?.focus();
      }, 100);
    } catch (err: any) {
      alert(err.message || 'Error recording voucher');
    } finally {
      setSaving(false);
    }
  };

  // Instant Accept shortcut (Ctrl+A)
  const triggerInstantAccept = () => {
    if (!partyName.trim()) {
      partyInputRef.current?.focus();
      alert('Please fill in Party Name before saving.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      amountInputRef.current?.focus();
      alert('Please enter an Amount greater than ₹ 0.');
      return;
    }
    handleSaveVoucher();
  };

  // Global & Window KeyDown Listeners (Function Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping =
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');

      // 1. When modal is NOT open:
      if (!showModal) {
        // [V] or [Alt+V] opens Voucher Creation
        if ((e.altKey && (e.key === 'v' || e.key === 'V')) || (!isTyping && (e.key === 'v' || e.key === 'V'))) {
          e.preventDefault();
          openVoucherCreation('Payment Voucher');
          return;
        }

        // Direct F-Keys to open specific voucher type
        if (['F4', 'F5', 'F6', 'F7', 'F8', 'F9'].includes(e.key)) {
          e.preventDefault();
          if (e.altKey && e.key === 'F8') {
            openVoucherCreation('Credit Note');
          } else if (e.altKey && e.key === 'F9') {
            openVoucherCreation('Debit Note');
          } else {
            const map: Record<string, VoucherType> = {
              F4: 'Contra Voucher',
              F5: 'Payment Voucher',
              F6: 'Receipt Voucher',
              F7: 'Journal Voucher',
              F8: 'Sales Voucher',
              F9: 'Purchase Voucher',
            };
            if (map[e.key]) openVoucherCreation(map[e.key]);
          }
          return;
        }
        return;
      }

      // 2. When modal IS open:
      // Quick Save: Ctrl+A or Cmd+A
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        triggerInstantAccept();
        return;
      }

      // Esc handling
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showAcceptPrompt) {
          setShowAcceptPrompt(false);
          narrationInputRef.current?.focus();
        } else if (showDebitDropdown || showCreditDropdown) {
          setShowDebitDropdown(false);
          setShowCreditDropdown(false);
        } else {
          setShowModal(false);
        }
        return;
      }

      // F-Keys switching voucher type inside modal
      if (['F4', 'F5', 'F6', 'F7', 'F8', 'F9'].includes(e.key)) {
        e.preventDefault();
        if (e.altKey && e.key === 'F8') {
          handleSelectVoucherType('Credit Note');
        } else if (e.altKey && e.key === 'F9') {
          handleSelectVoucherType('Debit Note');
        } else {
          const map: Record<string, VoucherType> = {
            F4: 'Contra Voucher',
            F5: 'Payment Voucher',
            F6: 'Receipt Voucher',
            F7: 'Journal Voucher',
            F8: 'Sales Voucher',
            F9: 'Purchase Voucher',
          };
          if (map[e.key]) handleSelectVoucherType(map[e.key]);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, showAcceptPrompt, showDebitDropdown, showCreditDropdown, partyName, amount, vType]);

  // Focus the "Yes" button when Accept Prompt appears
  useEffect(() => {
    if (showAcceptPrompt) {
      acceptYesBtnRef.current?.focus();
    }
  }, [showAcceptPrompt]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this accounting voucher? This action will be audited.')) {
      try {
        await request(`/vouchers/${id}`, { method: 'DELETE' });
        fetchVouchers();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // KPI Calculations
  const totalPaidOut = vouchers
    .filter((v) => v.type === 'Payment Voucher')
    .reduce((s, v) => s + v.amount, 0);

  const totalReceived = vouchers
    .filter((v) => v.type === 'Receipt Voucher' || v.type === 'Sales Voucher')
    .reduce((s, v) => s + v.amount, 0);

  const totalPurchases = vouchers
    .filter((v) => v.type === 'Purchase Voucher')
    .reduce((s, v) => s + v.amount, 0);

  const totalReturnsNotes = vouchers
    .filter((v) => v.type === 'Credit Note' || v.type === 'Debit Note')
    .reduce((s, v) => s + v.amount, 0);

  const currentDebitBal = getAccountBalanceDisplay(debitAccount);
  const currentCreditBal = getAccountBalanceDisplay(creditAccount);
  const activeCfg = VOUCHER_CONFIGS[vType];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] bg-[#0A1931] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-orange-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="h-7 w-7 rounded-full bg-[#FF5500] text-white flex items-center justify-center font-bold text-xs">
            ✓
          </div>
          <span className="font-semibold text-xs text-slate-100">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0A1931] tracking-tight">
            Vouchers
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openVoucherCreation('Payment Voucher')}
            className="inline-flex items-center justify-center gap-2 bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold text-sm px-6 py-3 rounded-full shadow-lg shadow-orange-500/20 active:scale-[0.98] transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Voucher</span>
          </button>
        </div>
      </div>

      {/* Quick Selection Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 pl-2">
          <Keyboard className="w-4 h-4 text-[#FF5500]" />
          <span className="whitespace-nowrap uppercase tracking-wider text-[11px] text-slate-500 font-bold">Quick Select:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {Object.entries(VOUCHER_CONFIGS).map(([type]) => (
            <button
              key={type}
              onClick={() => openVoucherCreation(type as VoucherType)}
              className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FAFAFB] hover:bg-[#FFF5EF] text-slate-700 hover:text-[#FF5500] border border-slate-200 hover:border-orange-200 transition cursor-pointer whitespace-nowrap active:scale-95"
            >
              <span>{type.replace(' Voucher', '')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Money Received</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{formatMoney(totalReceived)}</div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Money Paid Out</span>
          <div className="text-2xl font-black text-rose-500 mt-1">{formatMoney(totalPaidOut)}</div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Stock Purchases</span>
          <div className="text-2xl font-black text-[#0A1931] mt-1">{formatMoney(totalPurchases)}</div>
        </div>

        <div className="bg-[#FFF5EF] border border-[#FFE8DC] rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF5500]">Returns & Adjustments</span>
          <div className="text-2xl font-black text-[#FF5500] mt-1">{formatMoney(totalReturnsNotes)}</div>
        </div>
      </div>

      {/* Voucher Types Filter Grid */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Filter by Voucher Type:</span>
          <button
            onClick={() => setSelectedType('all')}
            className={`text-xs font-bold px-3 py-1 rounded-full transition ${
              selectedType === 'all' ? 'bg-[#FF5500] text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Show All ({vouchers.length})
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {VOUCHER_TYPES.map((vt) => (
            <button
              key={vt.type}
              onClick={() => setSelectedType(vt.type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                selectedType === vt.type
                  ? 'bg-[#FF5500] border-[#FF5500] text-white shadow-md shadow-orange-500/20'
                  : 'bg-[#FAFAFB] border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>{vt.type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Collection Method Filters */}
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
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-full md:w-72 bg-[#FAFAFB] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF5500]"
          >
            <option value="all">All Collection & Settlement Methods</option>
            {COLLECTION_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vouchers Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FB] text-slate-500 uppercase font-bold tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-4 px-5">Voucher #</th>
                <th className="py-4 px-5">Type & Date</th>
                <th className="py-4 px-5">Party Name</th>
                <th className="py-4 px-5">Debit Account (Dr)</th>
                <th className="py-4 px-5">Credit Account (Cr)</th>
                <th className="py-4 px-5 text-right">Amount</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 text-sm">
                    No vouchers found matching criteria.
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v._id} className="hover:bg-[#FFFBF8] transition">
                    <td className="py-4 px-5 font-bold text-[#FF5500]">
                      <button
                        onClick={() => setViewingVoucher(v)}
                        className="hover:underline flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{v.voucherNumber}</span>
                      </button>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                          v.type === 'Payment Voucher'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : v.type === 'Receipt Voucher'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : v.type === 'Sales Voucher'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : v.type === 'Purchase Voucher'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : v.type === 'Contra Voucher'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : v.type === 'Credit Note'
                            ? 'bg-orange-50 text-[#FF5500] border border-orange-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {v.type}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(v.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-[#0A1931]">{v.partyName}</div>
                      {v.referenceNumber && (
                        <div className="text-[10px] text-slate-400">Ref: {v.referenceNumber}</div>
                      )}
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-700">
                      <span className="text-rose-600 font-bold mr-1">Dr:</span>
                      {v.debitAccount}
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-700">
                      <span className="text-emerald-600 font-bold mr-1">Cr:</span>
                      {v.creditAccount}
                    </td>
                    <td className="py-4 px-5 text-right font-extrabold text-[#0A1931] text-sm">
                      {formatMoney(v.amount)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingVoucher(v)}
                          title="View Voucher"
                          className="p-2 text-slate-400 hover:text-[#FF5500] hover:bg-orange-50 rounded-xl transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v._id)}
                          title="Delete Voucher"
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

      {/* ========================================================================= */}
      {/* SIMPLIFIED VOUCHER CREATION MODAL                                         */}
      {/* ========================================================================= */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-[#0A1931]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => {
            setShowDebitDropdown(false);
            setShowCreditDropdown(false);
          }}
        >
          <div
            className="bg-white border border-slate-100 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="bg-[#0A1931] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-xl bg-[#FF5500] text-white font-black text-sm flex items-center justify-center shadow-md shadow-orange-500/30">
                  7
                </span>
                <div>
                  <div className="font-extrabold text-base tracking-tight text-white">
                    New Voucher
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>
                      Mode: <strong className="text-white font-bold">{vType}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-orange-400 font-mono font-semibold">
                      {activeCfg.prefix}-2026-{(vouchers.length + 1).toString().padStart(4, '0')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 bg-[#FAFAFB]/60 max-h-[80vh]">
              {/* Voucher Type Selector Pills */}
              <div className="bg-white border border-slate-200/80 p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto shadow-xs">
                {Object.entries(VOUCHER_CONFIGS).map(([type]) => {
                  const isSelected = vType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSelectVoucherType(type as VoucherType)}
                      className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-[#FF5500] text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-500/20'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                      }`}
                    >
                      <span>{type.replace(' Voucher', '')}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Accounting Entry Presets */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs space-y-2">
                <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>Quick Accounting Presets (Instant Fill)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Click to auto-configure debit & credit</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPreset('capital_ajmalsha')}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Capital: AJMALSHA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('capital_ashique')}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Capital: ASHIQUE SALIM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('capital_shanu')}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Capital: SHANU</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('drawings_ajmalsha')}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/80 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>- Drawings: AJMALSHA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('inventory')}
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200/80 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>📦 Stock / Supplier Bill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('ads')}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>📢 Meta / Google Ads</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('courier')}
                    className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>🚚 Courier Freight</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('contra_deposit')}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>🔄 Cash to Bank</span>
                  </button>
                </div>
              </div>

              {/* Form Fields Card */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                {/* Row 1: Date & Amount */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Date *</label>
                    </div>
                    <input
                      ref={dateInputRef}
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          amountInputRef.current?.focus();
                        }
                      }}
                      className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#FF5500] focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Amount *</label>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-sm">₹</span>
                      <input
                        ref={amountInputRef}
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (!amount || Number(amount) <= 0) {
                              alert('Please enter a valid amount.');
                              return;
                            }
                            debitInputRef.current?.focus();
                          }
                        }}
                        className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-slate-900 font-extrabold focus:outline-none focus:border-[#FF5500] focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Debit Ledger (Dr) */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="text-rose-600 font-black">Dr (Debit):</span>
                      <span>{activeCfg.debitLabel} *</span>
                    </label>
                    {currentDebitBal && (
                      <div className="text-[11px] font-medium text-slate-500">
                        Balance:{' '}
                        <span className="font-extrabold text-rose-600">{currentDebitBal.formatted}</span>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      ref={debitInputRef}
                      type="text"
                      required
                      value={debitAccount}
                      onFocus={() => setShowDebitDropdown(true)}
                      onChange={(e) => {
                        setDebitAccount(e.target.value);
                        setShowDebitDropdown(true);
                        setDebitSelectedIndex(0);
                      }}
                      onKeyDown={(e) => {
                        if (showDebitDropdown && filteredDebitLedgers.length > 0) {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setDebitSelectedIndex((prev) =>
                              Math.min(prev + 1, filteredDebitLedgers.length - 1)
                            );
                            return;
                          }
                          if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setDebitSelectedIndex((prev) => Math.max(prev - 1, 0));
                            return;
                          }
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const chosen = filteredDebitLedgers[debitSelectedIndex];
                            if (chosen) setDebitAccount(chosen.name);
                            setShowDebitDropdown(false);
                            creditInputRef.current?.focus();
                            return;
                          }
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          setShowDebitDropdown(false);
                          creditInputRef.current?.focus();
                        }
                      }}
                      className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#FF5500] focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition"
                    />

                    {/* Floating Autocomplete Popup */}
                    {showDebitDropdown && filteredDebitLedgers.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                        <div className="bg-[#0A1931] text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex justify-between items-center">
                          <span>List of Ledger Accounts</span>
                        </div>
                        {filteredDebitLedgers.map((l, idx) => {
                          const isSelected = idx === debitSelectedIndex;
                          const isDr = ['Asset', 'Expense'].includes(l.type) ? l.balance >= 0 : l.balance < 0;
                          return (
                            <button
                              key={l.name}
                              type="button"
                              onClick={() => {
                                setDebitAccount(l.name);
                                setShowDebitDropdown(false);
                                creditInputRef.current?.focus();
                              }}
                              onMouseEnter={() => setDebitSelectedIndex(idx)}
                              className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-xs transition cursor-pointer ${
                                isSelected ? 'bg-[#FFF5EF] text-[#FF5500] font-bold' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div>
                                <span className="font-semibold">{l.name}</span>
                              </div>
                              <div className="text-right">
                                <span className={`text-[11px] font-bold ${isDr ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {formatMoney(Math.abs(l.balance))} {isDr ? 'Dr' : 'Cr'}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-normal">{l.subType}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 3: Credit Ledger (Cr) */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="text-emerald-600 font-black">Cr (Credit):</span>
                      <span>{activeCfg.creditLabel} *</span>
                    </label>
                    {currentCreditBal && (
                      <div className="text-[11px] font-medium text-slate-500">
                        Balance:{' '}
                        <span className="font-extrabold text-emerald-600">{currentCreditBal.formatted}</span>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      ref={creditInputRef}
                      type="text"
                      required
                      value={creditAccount}
                      onFocus={() => setShowCreditDropdown(true)}
                      onChange={(e) => {
                        setCreditAccount(e.target.value);
                        setShowCreditDropdown(true);
                        setCreditSelectedIndex(0);
                      }}
                      onKeyDown={(e) => {
                        if (showCreditDropdown && filteredCreditLedgers.length > 0) {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setCreditSelectedIndex((prev) =>
                              Math.min(prev + 1, filteredCreditLedgers.length - 1)
                            );
                            return;
                          }
                          if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setCreditSelectedIndex((prev) => Math.max(prev - 1, 0));
                            return;
                          }
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const chosen = filteredCreditLedgers[creditSelectedIndex];
                            if (chosen) setCreditAccount(chosen.name);
                            setShowCreditDropdown(false);
                            partyInputRef.current?.focus();
                            return;
                          }
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          setShowCreditDropdown(false);
                          partyInputRef.current?.focus();
                        }
                      }}
                      className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#FF5500] focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition"
                    />

                    {/* Floating Autocomplete Popup */}
                    {showCreditDropdown && filteredCreditLedgers.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                        <div className="bg-[#0A1931] text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex justify-between items-center">
                          <span>List of Ledger Accounts</span>
                        </div>
                        {filteredCreditLedgers.map((l, idx) => {
                          const isSelected = idx === creditSelectedIndex;
                          const isDr = ['Asset', 'Expense'].includes(l.type) ? l.balance >= 0 : l.balance < 0;
                          return (
                            <button
                              key={l.name}
                              type="button"
                              onClick={() => {
                                setCreditAccount(l.name);
                                setShowCreditDropdown(false);
                                partyInputRef.current?.focus();
                              }}
                              onMouseEnter={() => setCreditSelectedIndex(idx)}
                              className={`w-full text-left px-3.5 py-2 flex items-center justify-between text-xs transition cursor-pointer ${
                                isSelected ? 'bg-[#FFF5EF] text-[#FF5500] font-bold' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div>
                                <span className="font-semibold">{l.name}</span>
                              </div>
                              <div className="text-right">
                                <span className={`text-[11px] font-bold ${isDr ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {formatMoney(Math.abs(l.balance))} {isDr ? 'Dr' : 'Cr'}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-normal">{l.subType}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 4: Party Name */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Party / Particulars Name
                    </label>
                  </div>
                  <input
                    ref={partyInputRef}
                    type="text"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        narrationInputRef.current?.focus();
                      }
                    }}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#FF5500] focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition"
                  />
                </div>

                {/* Row 5: Narration */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Narration / Note
                    </label>
                  </div>
                  <input
                    ref={narrationInputRef}
                    type="text"
                    value={narration}
                    onChange={(e) => setNarration(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!amount || Number(amount) <= 0) {
                          amountInputRef.current?.focus();
                          alert('Please enter an Amount before saving.');
                          return;
                        }
                        setShowAcceptPrompt(true);
                      }
                    }}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#FF5500] focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition"
                  />
                </div>

                {/* Accept Confirmation Prompt */}
                {showAcceptPrompt && (
                  <div className="bg-[#FFF5EF] border-2 border-[#FF5500] rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FF5500] text-white flex items-center justify-center font-black">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-[#0A1931]">Accept & Post Voucher?</div>
                        <div className="text-xs text-slate-500">
                          {vType} • <span className="font-bold text-[#FF5500]">{formatMoney(Number(amount))}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAcceptPrompt(false);
                          narrationInputRef.current?.focus();
                        }}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Cancel</span>
                      </button>
                      <button
                        ref={acceptYesBtnRef}
                        type="button"
                        disabled={saving}
                        onClick={handleSaveVoucher}
                        className="flex-1 sm:flex-initial px-6 py-2 rounded-xl bg-[#FF5500] hover:bg-[#E04B00] text-white font-extrabold text-xs shadow-lg shadow-orange-500/30 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{saving ? 'Posting...' : 'Yes, Save'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Summary Bar & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="font-medium">Total Voucher:</span>
                    <span className="font-extrabold text-[#0A1931] text-base">
                      {amount ? formatMoney(Number(amount)) : '₹ 0.00'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={triggerInstantAccept}
                      className="bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Save Voucher</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Voucher View Modal */}
      {viewingVoucher && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-xl p-8 shadow-2xl space-y-6 text-slate-800 print:p-0 print:border-none">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-xl bg-[#FF5500] text-white font-black text-sm flex items-center justify-center">
                  7
                </span>
                <span className="font-extrabold text-base text-[#0A1931]">CartSeven Accounting Voucher</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-slate-400 hover:text-[#FF5500] hover:bg-orange-50 rounded-xl"
                  title="Print Voucher"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewingVoucher(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-[#FFF5EF] border border-[#FFE8DC] rounded-2xl p-5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#FF5500] uppercase tracking-wider">{viewingVoucher.type}</span>
                <span className="font-extrabold text-[#0A1931]">{viewingVoucher.voucherNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Date: <strong>{new Date(viewingVoucher.date).toLocaleDateString()}</strong></span>
                <span>Status: <strong className="text-emerald-600 uppercase">Posted & Audited</strong></span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Party Name:</span>
                <span className="font-bold text-[#0A1931]">{viewingVoucher.partyName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Debit Account (Dr):</span>
                <span className="font-bold text-rose-600">{viewingVoucher.debitAccount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Credit Account (Cr):</span>
                <span className="font-bold text-emerald-600">{viewingVoucher.creditAccount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Collection / Settlement:</span>
                <span className="font-semibold text-slate-800">{viewingVoucher.collectionMethod}</span>
              </div>
              {viewingVoucher.referenceNumber && (
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Reference #:</span>
                  <span className="font-bold text-slate-800">{viewingVoucher.referenceNumber}</span>
                </div>
              )}
              {viewingVoucher.narration && (
                <div className="py-2">
                  <span className="text-slate-500 font-medium block mb-1">Narration:</span>
                  <p className="bg-[#FAFAFB] p-3 rounded-xl italic text-slate-700 leading-relaxed">
                    {viewingVoucher.narration}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-[#F8F9FB] p-4 rounded-2xl flex justify-between items-center">
              <span className="font-extrabold text-[#0A1931] text-sm">Voucher Total Amount:</span>
              <span className="text-2xl font-black text-[#FF5500]">{formatMoney(viewingVoucher.amount)}</span>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100 text-center text-[10px] text-slate-400">
              <div className="border-t border-dashed border-slate-300 pt-2">
                Prepared by: <strong className="text-slate-700">{viewingVoucher.createdByName}</strong>
              </div>
              <div className="border-t border-dashed border-slate-300 pt-2">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
