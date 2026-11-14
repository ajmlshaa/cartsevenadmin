import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { CartSevenLogo } from '../components/CartSevenLogo';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    setLoading(false);

    if (success) {
      navigate('/');
    } else {
      setError('Invalid email or password. You can use the 1-click test buttons below.');
    }
  };

  const handleQuickLogin = async (partnerKey: 'partner1' | 'partner2' | 'partner3' | string) => {
    const target = DEMO_USERS[partnerKey];
    if (target) {
      setEmail(target.email);
      setPassword('password123');
      setLoading(true);
      await login(target.email, 'password123');
      setLoading(false);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] flex items-center justify-center p-4 sm:p-6 lg:p-10 select-none">
      {/* Outer Split Container - Quicount Accounting Style */}
      <div className="w-full max-w-5xl bg-white border border-slate-100 rounded-3xl shadow-[0_10px_40px_-5px_rgba(0,0,0,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Half: Authentication Form (7 cols on lg) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
          {/* Top Logo */}
          <div className="flex items-center justify-between">
            <CartSevenLogo size="md" />
          </div>

          {/* Form Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A1931] tracking-tight">
              Sign In
            </h2>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-2xl font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold py-3.5 rounded-full text-sm shadow-lg shadow-orange-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to CartSeven'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* 1-Click Partner Access */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              1-Click Partner Access:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('partner1')}
                className="bg-[#FAFAFB] hover:bg-[#FFF5EF] border border-slate-200 hover:border-[#FF5500] p-2.5 rounded-xl text-left transition group cursor-pointer"
              >
                <div className="font-extrabold text-[#0A1931] text-xs group-hover:text-[#FF5500]">
                  AJMALSHA
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Managing Partner</div>
                <div className="text-[9px] text-[#FF5500] font-bold mt-0.5">Admin & Governance</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('partner2')}
                className="bg-[#FAFAFB] hover:bg-[#FFF5EF] border border-slate-200 hover:border-[#FF5500] p-2.5 rounded-xl text-left transition group cursor-pointer"
              >
                <div className="font-extrabold text-[#0A1931] text-xs group-hover:text-[#FF5500]">
                  ASHIQUE SALIM
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Finance Partner</div>
                <div className="text-[9px] text-blue-600 font-bold mt-0.5">Accounts & Audit</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('partner3')}
                className="bg-[#FAFAFB] hover:bg-[#FFF5EF] border border-slate-200 hover:border-[#FF5500] p-2.5 rounded-xl text-left transition group cursor-pointer"
              >
                <div className="font-extrabold text-[#0A1931] text-xs group-hover:text-[#FF5500]">
                  SHANU
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Operations Partner</div>
                <div className="text-[9px] text-amber-600 font-bold mt-0.5">Logistics & Stock</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Half: Brand Container (5 cols on lg) */}
        <div className="lg:col-span-5 bg-[#FFF5EF] border-t lg:border-t-0 lg:border-l border-[#FFE8DC] p-8 sm:p-12 flex flex-col justify-center items-center relative overflow-hidden">
          {/* Subtle background circles */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-orange-200/30 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-orange-300/20 blur-2xl pointer-events-none" />

          {/* Center Brand Illustration */}
          <div className="relative z-10 space-y-6 text-center">
            <div className="flex justify-center">
              <CartSevenLogo size="lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
