import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { CartSevenLogo } from '../components/CartSevenLogo';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRestricted, setIsRestricted] = useState(false);

  const publicStoreUrl =
    (import.meta as any).env?.VITE_PUBLIC_STORE_URL || 'https://cartseven.com/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsRestricted(false);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Invalid credentials.');
      if (result.isRestricted || result.redirectUrl) {
        setIsRestricted(true);
      }
    }
  };

  const handleRedirect = () => {
    window.location.href = publicStoreUrl;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] flex items-center justify-center p-4 sm:p-6 lg:p-10 select-none">
      {/* Outer Split Container */}
      <div className="w-full max-w-4xl bg-white border border-slate-100 rounded-3xl shadow-[0_10px_40px_-5px_rgba(0,0,0,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* Left Half: Authentication Form (7 cols on lg) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
          {/* Top Logo */}
          <div className="flex items-center justify-between">
            <CartSevenLogo size="md" />
          </div>

          {/* Form Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A1931] tracking-tight">
              Sign In
            </h2>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-2.5">
              <div className="text-rose-800 text-xs font-bold leading-relaxed">
                {error}
              </div>
              {isRestricted && (
                <button
                  type="button"
                  onClick={handleRedirect}
                  className="w-full bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold py-2.5 px-4 rounded-full transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Redirect to https://cartseven.com/</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Email</label>
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
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Minimal footer link */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end text-xs">
            <button
              type="button"
              onClick={handleRedirect}
              className="text-slate-400 hover:text-[#FF5500] transition inline-flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>cartseven.com</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Half: Brand Container (5 cols on lg) */}
        <div className="lg:col-span-5 bg-[#FFF5EF] border-t lg:border-t-0 lg:border-l border-[#FFE8DC] p-8 sm:p-12 flex flex-col justify-center items-center relative overflow-hidden text-center">
          {/* Subtle background circles */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-orange-200/30 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-orange-300/20 blur-2xl pointer-events-none" />

          {/* Center Brand Illustration */}
          <div className="relative z-10">
            <CartSevenLogo size="lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
