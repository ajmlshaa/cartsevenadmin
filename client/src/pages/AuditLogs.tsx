import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  MapPin,
  Clock,
  User,
  Activity,
  Layers,
} from 'lucide-react';
import { request } from '../services/api';
import { AuditLog } from '../types';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await request<{ success: boolean; data: AuditLog[] }>(
        `/audit?action=${actionFilter}`
      );
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const filteredLogs = logs.filter((l) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      l.userName.toLowerCase().includes(term) ||
      l.details.toLowerCase().includes(term) ||
      l.entity.toLowerCase().includes(term) ||
      l.location.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0A1931] tracking-tight">
          Audit Logs
        </h1>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF5500] focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['all', 'CREATE', 'UPDATE', 'DELETE', 'PAYMENT_RECORDED'].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                actionFilter === act
                  ? 'bg-[#FF5500] text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {act === 'PAYMENT_RECORDED' ? 'Payments' : act}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FB] text-slate-500 uppercase font-bold tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-4 px-5">Timestamp</th>
                <th className="py-4 px-5">User</th>
                <th className="py-4 px-5">Action</th>
                <th className="py-4 px-5">Entity</th>
                <th className="py-4 px-5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400 text-sm">
                    No audit records matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#FFFBF8] transition">
                    <td className="py-4 px-5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-[#0A1931]">{log.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.userEmail}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.action === 'PAYMENT_RECORDED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : log.action === 'DELETE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-700">{log.entity}</td>
                    <td className="py-4 px-5 text-slate-700 max-w-lg">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
