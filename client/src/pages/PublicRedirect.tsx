import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Lock,
  Mail,
  Store,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { CartSevenLogo } from '../components/CartSevenLogo';
import { useAuth } from '../context/AuthContext';

export const PublicRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const publicStoreUrl =
    (import.meta as any).env?.VITE_PUBLIC_STORE_URL || 'https://cartseven.com/';

  const [countdown, setCountdown] = useState<number>(10);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showPartnerLogin, setShowPartnerLogin] = useState<boolean>(false);

  // Partner Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isUnauthorizedVisitor, setIsUnauthorizedVisitor] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Auto-redirect countdown
  useEffect(() => {
    if (showPartnerLogin || isPaused) return;

    if (countdown <= 0) {
      window.location.href = publicStoreUrl;
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isPaused, showPartnerLogin, publicStoreUrl]);

  const handleManualRedirect = () => {
    window.location.href = publicStoreUrl;
  };

  const handlePartnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsUnauthorizedVisitor(false);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setAuthError(result.message || 'Invalid partner credentials.');
      if (result.isRestricted || result.redirectUrl) {
        setIsUnauthorizedVisitor(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] flex flex-col justify-between p-4 sm:p-6 lg:p-10 select-none">
      {/* Top Navigation Bar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-4">
        <CartSevenLogo size="md" />

        <button
          onClick={handleManualRedirect}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#FF5500] bg-white border border-slate-200 hover:border-[#FF5500] px-4 py-2 rounded-full transition shadow-sm cursor-pointer"
        >
          <Store className="w-3.5 h-3.5 text-[#FF5500]" />
          <span>Visit cartseven.com</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto my-auto py-6">
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_15px_50px_-10px_rgba(0,0,0,0.07)] overflow-hidden">
          {/* Top Banner Stripe */}
          <div className="bg-gradient-to-r from-[#FF5500] to-[#E04B00] px-6 py-2.5 flex items-center justify-between text-white text-xs font-semibold">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              CartSeven Private Internal Accounting System
            </span>
            <span className="text-white/80 text-[11px] hidden sm:inline">
              Strict Access Control Enforced
            </span>
          </div>

          <div className="p-8 sm:p-12 space-y-8">
            {/* Header Content */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200/70 text-amber-600 mb-2 shadow-sm">
                <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-[#0A1931] tracking-tight">
                Restricted Partner Portal
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                This internal accounting site is strictly restricted to the{' '}
                <strong className="text-[#0A1931] font-bold">3 authorized partners</strong> of CartSeven.
                Public visitors, customers, and online shoppers are redirected to our official web store.
              </p>
            </div>

            {/* If NOT viewing login form: Show primary Redirect to https://cartseven.com/ */}
            {!showPartnerLogin ? (
              <div className="space-y-6 max-w-xl mx-auto">
                {/* Big Action Box to redirect */}
                <div className="bg-[#FFF5EF] border border-[#FFE8DC] rounded-2xl p-6 sm:p-8 text-center space-y-5">
                  <div className="space-y-1">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-[#FF5500]">
                      Official Customer & Public Storefront
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0A1931]">
                      cartseven.com
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600">
                    Click below to visit the official CartSeven e-commerce store for product browsing, customer orders, and support.
                  </p>

                  <button
                    onClick={handleManualRedirect}
                    className="w-full bg-[#FF5500] hover:bg-[#E04B00] text-white font-extrabold py-4 px-6 rounded-full text-base shadow-lg shadow-orange-500/25 active:scale-[0.98] transition flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <span>Proceed to https://cartseven.com/</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  {/* Countdown Timer */}
                  <div className="pt-2 flex items-center justify-center gap-3 text-xs text-slate-500">
                    <span>
                      Automatic redirect in <strong className="text-slate-900 font-bold">{countdown}s</strong>
                    </span>
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-full cursor-pointer transition"
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-3 h-3 text-emerald-600" />
                          <span>Resume</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3 text-amber-600" />
                          <span>Pause</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Partner Login Toggle */}
                <div className="pt-4 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setShowPartnerLogin(true);
                      setIsPaused(true);
                    }}
                    className="inline-flex items-center gap-2 text-xs font-extrabold text-[#0A1931] hover:text-[#FF5500] py-2 px-4 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>Authorized Partner? Sign In Here</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Partner Login Form (Secured for 3 partners from .env) */
              <div className="max-w-md mx-auto space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Lock className="w-4 h-4 text-[#FF5500]" />
                    <span>Authorized Partner Authentication</span>
                  </div>
                  <button
                    onClick={() => setShowPartnerLogin(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {authError && (
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-2">
                    <div className="text-rose-800 font-bold text-xs">
                      {authError}
                    </div>
                    {isUnauthorizedVisitor && (
                      <div className="pt-2 border-t border-rose-200/60">
                        <button
                          onClick={handleManualRedirect}
                          className="w-full bg-[#FF5500] hover:bg-[#E04B00] text-white text-xs font-bold py-2.5 px-4 rounded-full transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <span>Redirect to https://cartseven.com/</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handlePartnerLogin} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">
                      Email
                    </label>
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
                    <label className="block text-slate-700 font-bold mb-1.5">
                      Password
                    </label>
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
                    className="w-full bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold py-3.5 rounded-full text-sm shadow-lg shadow-orange-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </form>

                <div className="pt-3 text-center">
                  <button
                    type="button"
                    onClick={handleManualRedirect}
                    className="text-xs text-slate-400 hover:text-[#FF5500] transition cursor-pointer inline-flex items-center gap-1 font-medium"
                  >
                    <span>cartseven.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center py-4 text-xs text-slate-400">
        CartSeven Multi-Location Financial Platform • Strictly Restricted Access • Public Store:{' '}
        <a
          href={publicStoreUrl}
          className="text-[#FF5500] font-bold hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          https://cartseven.com/
        </a>
      </footer>
    </div>
  );
};
