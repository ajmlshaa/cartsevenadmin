import React, { useState, useEffect } from 'react';
import {
  Scale,
  LineChart,
  PieChart,
  ShieldCheck,
  TrendingUp,
  FileText,
  Users,
  Building,
  Calendar,
  Layers,
  Printer,
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { request } from '../services/api';

interface ReportTab {
  id: string;
  name: string;
  icon: any;
}

const REPORTS_LIST: ReportTab[] = [
  { id: 'trial-balance', name: 'Trial Balance', icon: Scale },
  { id: 'trading-account', name: 'Trading Account', icon: LineChart },
  { id: 'profit-and-loss', name: 'Profit & Loss', icon: TrendingUp },
  { id: 'balance-sheet', name: 'Balance Sheet', icon: ShieldCheck },
  { id: 'cash-flow', name: 'Cash Flow', icon: PieChart },
  { id: 'stock-summary', name: 'Stock Summary', icon: Layers },
  { id: 'customer-outstanding', name: 'Customer Due', icon: Users },
  { id: 'supplier-outstanding', name: 'Supplier Due', icon: Building },
  { id: 'sales-purchase-summary', name: 'Sales & Purchase', icon: Calendar },
  { id: 'product-profitability', name: 'Product Profit', icon: FileText },
];

export const Reports: React.FC = () => {
  const { formatMoney } = useCurrency();
  const [activeReport, setActiveReport] = useState<string>('trial-balance');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setData(null);
        const res = await request<any>(`/reports/${activeReport}`);
        if (res?.data) {
          setData(res.data);
        }
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [activeReport]);

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
            Reports
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-full shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* 10 Reports Tab Navigation */}
      <div className="bg-white border border-slate-100 rounded-3xl p-3 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {REPORTS_LIST.map((rep) => {
            const Icon = rep.icon;
            const isActive = activeReport === rep.id;
            return (
              <button
                key={rep.id}
                onClick={() => setActiveReport(rep.id)}
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
                  <div className="text-xs font-bold leading-tight">{rep.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* REPORT 1: TRIAL BALANCE */}
      {activeReport === 'trial-balance' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Trial Balance</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-6">Account Title</th>
                  <th className="py-3.5 px-6 text-right">Debit Balance (Dr)</th>
                  <th className="py-3.5 px-6 text-right">Credit Balance (Cr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.items && data.items.length > 0 ? (
                  data.items.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3 px-6 font-bold text-[#0A1931]">{row.account}</td>
                      <td className="py-3 px-6 text-right font-mono font-bold text-rose-600">
                        {row.debit > 0 ? formatMoney(row.debit) : '-'}
                      </td>
                      <td className="py-3 px-6 text-right font-mono font-bold text-emerald-600">
                        {row.credit > 0 ? formatMoney(row.credit) : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  renderEmptyRow(3)
                )}
              </tbody>
              <tfoot className="bg-[#FFF5EF] border-t-2 border-[#FFE8DC]">
                <tr className="font-extrabold text-sm text-[#0A1931]">
                  <td className="py-4 px-6 uppercase tracking-wider text-right font-black">
                    Total Balanced Sum:
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-[#FF5500] font-black">
                    {formatMoney(data?.totalDebit || 0)}
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-[#FF5500] font-black">
                    {formatMoney(data?.totalCredit || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: TRADING ACCOUNT */}
      {activeReport === 'trading-account' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-[#0A1931] text-lg">Trading Account</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            <div className="space-y-4">
              <div className="bg-[#F8F9FB] p-3.5 rounded-2xl font-extrabold text-sm text-slate-800">
                Dr. (Debit: Direct Purchases & COGS)
              </div>
              <div className="space-y-2">
                {data?.debitSide && data.debitSide.length > 0 ? (
                  data.debitSide.map((item: any, i: number) => (
                    <div key={i} className={`flex justify-between py-1.5 px-3 rounded-xl ${item.isHighlight ? 'bg-[#FFF5EF] border border-[#FFE8DC] font-extrabold text-[#FF5500] text-sm' : 'border-b border-slate-100 text-slate-700'}`}>
                      <span>{item.name}</span>
                      <span className="font-mono">{formatMoney(item.amount || 0)}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400">No trading debits recorded.</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#F8F9FB] p-3.5 rounded-2xl font-extrabold text-sm text-slate-800">
                Cr. (Credit: Sales & Closing Stock)
              </div>
              <div className="space-y-2">
                {data?.creditSide && data.creditSide.length > 0 ? (
                  data.creditSide.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between py-1.5 px-3 border-b border-slate-100 text-slate-700">
                      <span>{item.name}</span>
                      <span className="font-mono font-bold text-[#0A1931]">{formatMoney(item.amount || 0)}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400">No trading credits recorded.</div>
                )}
                <div className="flex justify-between py-3 px-3 bg-[#F8F9FB] rounded-xl font-extrabold text-[#0A1931] text-sm mt-8">
                  <span>Total Trading Turnover:</span>
                  <span className="font-mono font-black">{formatMoney(data?.totalTradingTurnover || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: PROFIT & LOSS */}
      {activeReport === 'profit-and-loss' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-[#0A1931] text-lg">Profit & Loss Statement</h3>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-[#FFF5EF] border border-[#FFE8DC] p-4 rounded-2xl flex justify-between font-extrabold text-sm text-[#0A1931]">
              <span>Gross Profit b/d from Trading Account:</span>
              <span className="font-mono text-base text-[#FF5500]">{formatMoney(data?.grossProfit || 0)}</span>
            </div>

            <div className="pt-2">
              <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Operating Expenses (OpEx):</span>
              <div className="space-y-2 mt-2">
                {data?.operatingExpenses && data.operatingExpenses.length > 0 ? (
                  data.operatingExpenses.map((exp: any, i: number) => (
                    <div key={i} className="flex justify-between py-1.5 px-3 border-b border-slate-100 text-slate-700">
                      <span>{exp.category}</span>
                      <span className="font-mono font-medium">{formatMoney(exp.amount || 0)}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-slate-400">No operating expenses recorded.</div>
                )}
              </div>
            </div>

            <div className="bg-[#0A1931] text-white p-5 rounded-2xl flex justify-between items-center text-sm font-extrabold">
              <div>
                <div className="text-lg">Net Profit for the Period:</div>
                <div className="text-xs text-orange-400 font-normal">Transferred to Owner's Capital Account</div>
              </div>
              <div className="font-mono text-2xl text-[#FF5500] font-black">{formatMoney(data?.netProfit || 0)}</div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 4: BALANCE SHEET */}
      {activeReport === 'balance-sheet' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-[#0A1931] text-lg">Balance Sheet</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-2xl flex justify-between font-extrabold text-sm text-[#0A1931]">
                <span>Total Assets</span>
                <span className="font-mono text-blue-700">{formatMoney(data?.assets?.totalAssets || 0)}</span>
              </div>
              <div className="space-y-1.5 pl-2">
                {data?.assets?.currentAssets ? (
                  [...(data.assets.currentAssets || []), ...(data.assets.fixedAssets || [])].map((a: any, i: number) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
                      <span>{a.name}</span>
                      <span className="font-mono font-bold text-slate-900">{formatMoney(a.amount || 0)}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-slate-400">No assets recorded.</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl flex justify-between font-extrabold text-sm text-[#0A1931]">
                <span>Liabilities & Equity</span>
                <span className="font-mono text-amber-700">{formatMoney(data?.liabilities?.totalLiabilitiesAndEquity || 0)}</span>
              </div>
              <div className="space-y-1.5 pl-2">
                {data?.liabilities?.currentLiabilities ? (
                  [
                    ...(data.liabilities.currentLiabilities || []),
                    ...(data.liabilities.longTermLiabilities || []),
                    ...(data.liabilities.equity || []),
                  ].map((l: any, i: number) => (
                    <div key={i} className="flex justify-between py-1 border-b border-slate-100 text-slate-700">
                      <span>{l.name}</span>
                      <span className="font-mono font-bold text-slate-900">{formatMoney(l.amount || 0)}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-slate-400">No liabilities recorded.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 5: CASH FLOW STATEMENT */}
      {activeReport === 'cash-flow' && (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-[#0A1931] text-lg">Cash Flow Statement</h3>
            </div>
          </div>

          <div className="space-y-6 text-xs">
            <div className="space-y-2">
              <span className="font-extrabold text-sm text-[#0A1931] uppercase tracking-wider">A. Cash Flows from Operating Activities:</span>
              <div className="bg-[#FAFAFB] p-4 rounded-2xl space-y-2">
                {data?.operatingActivities?.map((item: any, i: number) => (
                  <div key={i} className={`flex justify-between ${item.isTotal ? 'border-t border-slate-200 pt-2 font-extrabold text-[#0A1931]' : ''}`}>
                    <span>{item.name}</span>
                    <span className={`font-mono font-bold ${item.amount >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {formatMoney(item.amount || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-extrabold text-sm text-[#0A1931] uppercase tracking-wider">B. Cash Flows from Investing Activities:</span>
              <div className="bg-[#FAFAFB] p-4 rounded-2xl space-y-2">
                {data?.investingActivities?.map((item: any, i: number) => (
                  <div key={i} className={`flex justify-between ${item.isTotal ? 'border-t border-slate-200 pt-2 font-extrabold text-[#0A1931]' : ''}`}>
                    <span>{item.name}</span>
                    <span className="font-mono font-bold text-rose-500">
                      {formatMoney(item.amount || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-extrabold text-sm text-[#0A1931] uppercase tracking-wider">C. Cash Flows from Financing Activities:</span>
              <div className="bg-[#FAFAFB] p-4 rounded-2xl space-y-2">
                {data?.financingActivities?.map((item: any, i: number) => (
                  <div key={i} className={`flex justify-between ${item.isTotal ? 'border-t border-slate-200 pt-2 font-extrabold text-[#0A1931]' : ''}`}>
                    <span>{item.name}</span>
                    <span className="font-mono font-bold text-rose-500">
                      {formatMoney(item.amount || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FFF5EF] border border-[#FFE8DC] p-4 rounded-2xl flex justify-between font-extrabold text-sm text-[#0A1931]">
              <span>Closing Cash & Bank Balance:</span>
              <span className="font-mono text-base text-[#FF5500]">{formatMoney(data?.closingCashAndBank || 0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 6: STOCK SUMMARY */}
      {activeReport === 'stock-summary' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Stock Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-6">SKU</th>
                  <th className="py-3.5 px-6">Product Description</th>
                  <th className="py-3.5 px-6 text-center">Opening</th>
                  <th className="py-3.5 px-6 text-center text-emerald-600">Inward</th>
                  <th className="py-3.5 px-6 text-center text-rose-500">Outward</th>
                  <th className="py-3.5 px-6 text-center font-bold text-[#0A1931]">Closing Qty</th>
                  <th className="py-3.5 px-6 text-right">Cost Rate</th>
                  <th className="py-3.5 px-6 text-right">Stock Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.items && data.items.length > 0 ? (
                  data.items.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3.5 px-6 font-mono font-bold text-[#FF5500]">{row.sku}</td>
                      <td className="py-3.5 px-6 font-bold text-[#0A1931]">{row.name}</td>
                      <td className="py-3.5 px-6 text-center font-mono">{row.opening}</td>
                      <td className="py-3.5 px-6 text-center font-mono text-emerald-600 font-bold">+{row.inward}</td>
                      <td className="py-3.5 px-6 text-center font-mono text-rose-500 font-bold">-{row.outward}</td>
                      <td className="py-3.5 px-6 text-center font-mono font-black text-[#0A1931]">{row.closing}</td>
                      <td className="py-3.5 px-6 text-right font-mono">{formatMoney(row.unitRate)}</td>
                      <td className="py-3.5 px-6 text-right font-mono font-black text-[#0A1931]">{formatMoney(row.totalValue)}</td>
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

      {/* REPORT 7: CUSTOMER OUTSTANDING */}
      {activeReport === 'customer-outstanding' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Customer Outstanding</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-6">Customer / Company</th>
                  <th className="py-3.5 px-6 text-right">Total Invoiced</th>
                  <th className="py-3.5 px-6 text-right">Amount Paid</th>
                  <th className="py-3.5 px-6 text-right font-bold text-[#0A1931]">Total Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.customers && data.customers.length > 0 ? (
                  data.customers.map((c: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3.5 px-6 font-bold text-[#0A1931]">{c.name}</td>
                      <td className="py-3.5 px-6 text-right font-mono">{formatMoney(c.totalInvoiced)}</td>
                      <td className="py-3.5 px-6 text-right font-mono text-emerald-600 font-bold">{formatMoney(c.paid)}</td>
                      <td className="py-3.5 px-6 text-right font-mono font-black text-sm text-[#0A1931]">{formatMoney(c.totalOutstanding)}</td>
                    </tr>
                  ))
                ) : (
                  renderEmptyRow(4)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 8: SUPPLIER OUTSTANDING */}
      {activeReport === 'supplier-outstanding' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Supplier Outstanding</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-6">Supplier Vendor</th>
                  <th className="py-3.5 px-6 text-right">Total Billed</th>
                  <th className="py-3.5 px-6 text-right">Paid to Date</th>
                  <th className="py-3.5 px-6 text-right font-bold text-[#0A1931]">Balance Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.suppliers && data.suppliers.length > 0 ? (
                  data.suppliers.map((s: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3.5 px-6 font-bold text-[#0A1931]">{s.name}</td>
                      <td className="py-3.5 px-6 text-right font-mono">{formatMoney(s.totalBilled)}</td>
                      <td className="py-3.5 px-6 text-right font-mono text-emerald-600 font-bold">{formatMoney(s.paid)}</td>
                      <td className="py-3.5 px-6 text-right font-mono font-black text-sm text-rose-500">{formatMoney(s.totalPayable)}</td>
                    </tr>
                  ))
                ) : (
                  renderEmptyRow(4)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 9: SALES & PURCHASE SUMMARY */}
      {activeReport === 'sales-purchase-summary' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Sales & Purchase Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-6">Fiscal Month</th>
                  <th className="py-3.5 px-6 text-right text-emerald-600 font-bold">Gross Sales</th>
                  <th className="py-3.5 px-6 text-right text-rose-500 font-bold">Purchases Billed</th>
                  <th className="py-3.5 px-6 text-right">COGS Recognized</th>
                  <th className="py-3.5 px-6 text-right font-black text-[#0A1931]">Gross Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.monthlyData && data.monthlyData.length > 0 ? (
                  data.monthlyData.map((m: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3.5 px-6 font-bold text-[#0A1931]">{m.month}</td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-emerald-600">{formatMoney(m.sales || 0)}</td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-rose-500">{formatMoney(m.purchases || 0)}</td>
                      <td className="py-3.5 px-6 text-right font-mono text-slate-700">{formatMoney(m.cogs || 0)}</td>
                      <td className="py-3.5 px-6 text-right font-mono font-black text-[#FF5500] text-sm">{formatMoney(m.grossMargin || 0)}</td>
                    </tr>
                  ))
                ) : (
                  renderEmptyRow(5)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 10: PRODUCT PROFITABILITY */}
      {activeReport === 'product-profitability' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="bg-[#F8F9FB] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-[#0A1931] text-base">Product Profitability</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 bg-[#FAFAFB]">
                <tr>
                  <th className="py-3.5 px-6">SKU & Item</th>
                  <th className="py-3.5 px-6 text-center">Units Sold</th>
                  <th className="py-3.5 px-6 text-right">Selling Price</th>
                  <th className="py-3.5 px-6 text-right">Gross Revenue</th>
                  <th className="py-3.5 px-6 text-right font-bold text-emerald-600">Net Product Profit</th>
                  <th className="py-3.5 px-6 text-center">Net Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.products && data.products.length > 0 ? (
                  data.products.map((p: any, i: number) => (
                    <tr key={i} className="hover:bg-[#FFFBF8] transition">
                      <td className="py-3.5 px-6">
                        <div className="font-mono font-bold text-[#FF5500] text-[10px]">{p.sku}</div>
                        <div className="font-bold text-[#0A1931]">{p.name}</div>
                      </td>
                      <td className="py-3.5 px-6 text-center font-mono font-bold">{p.unitsSold}</td>
                      <td className="py-3.5 px-6 text-right font-mono">{formatMoney(p.sellingPrice)}</td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold">{formatMoney(p.grossRevenue)}</td>
                      <td className="py-3.5 px-6 text-right font-mono font-black text-emerald-600 text-sm">{formatMoney(p.netProfit)}</td>
                      <td className="py-3.5 px-6 text-center"><span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">{p.profitMargin}</span></td>
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
