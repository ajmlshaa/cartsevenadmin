import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Plus,
  Mail,
  Phone,
  CheckCircle,
  X,
  CreditCard,
  Building2,
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { request } from '../services/api';
import { User } from '../types';

export const TeamUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(Object.values(DEMO_USERS).filter(
    (u, index, self) => index === self.findIndex((t) => t._id === u._id)
  ));
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Add User State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'accountant' | 'manager'>('admin');
  const [location, setLocation] = useState('Central Office');
  const [phone, setPhone] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await request<{ success: boolean; data: User[] }>('/users');
      if (res.success && res.data && res.data.length > 0) {
        setUsers(res.data);
      }
    } catch {
      setUsers([DEMO_USERS.partner1, DEMO_USERS.partner2, DEMO_USERS.partner3]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Please fill in Name and Email');
      return;
    }

    try {
      await request('/users', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password: 'password123',
          role,
          location,
          phone,
        }),
      });
      setShowModal(false);
      fetchUsers();
      setName('');
      setEmail('');
      setPhone('');
    } catch (err: any) {
      const newUser: User = {
        _id: 'user_' + Date.now(),
        name,
        email,
        role,
        location,
        phone,
        isActive: true,
      };
      setUsers([...users, newUser]);
      setShowModal(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'P';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const getPartnerRoleTitle = (index: number) => {
    if (index === 0) return 'Managing Partner';
    if (index === 1) return 'Finance Partner';
    return 'Operations Partner';
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0A1931] tracking-tight">
            Partners
          </h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold text-sm px-6 py-3 rounded-full shadow-lg shadow-orange-500/20 active:scale-[0.98] transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Partner</span>
        </button>
      </div>

      {/* 3 Active Partner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {users.map((u, idx) => {
          const isCurrent = currentUser?.email === u.email;
          const partnerKey = `partner${idx + 1}`;
          const roleTitle = getPartnerRoleTitle(idx);

          return (
            <div
              key={u._id}
              className={`bg-white border rounded-3xl p-6 sm:p-7 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.05)] transition flex flex-col justify-between space-y-5 ${
                isCurrent ? 'border-[#FF5500] ring-2 ring-[#FF5500]/10' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF5EF] border border-[#FFE8DC] flex items-center justify-center text-base font-extrabold text-[#FF5500]">
                      {getInitials(u.name)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#0A1931] text-base">{u.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mt-0.5 bg-orange-50 text-[#FF5500] border border-orange-200">
                        {roleTitle}
                      </span>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#FF5500] bg-[#FFF5EF] border border-[#FFE8DC] px-2.5 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3 stroke-[2.5]" />
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-5 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-slate-700">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CreditCard className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span className="font-bold text-[#0A1931]">
                      Capital Account
                    </span>
                  </div>
                  {u.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Access Status:</span>
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    isCurrent
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isCurrent ? 'Currently Active' : 'Authorized Partner'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Partner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg my-8 p-6 sm:p-8 shadow-2xl space-y-5 text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-[#0A1931]">Add Partner</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Partner Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
