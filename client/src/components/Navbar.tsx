import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CartSevenLogo } from './CartSevenLogo';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const navLinks = [
    { label: 'Dashboard', to: '/' },
    { label: 'Vouchers', to: '/vouchers' },
    { label: 'Invoices', to: '/invoices' },
    { label: 'Expenses', to: '/expenses' },
    { label: 'Registers', to: '/registers' },
    { label: 'Ledgers', to: '/accounts' },
    { label: 'Reports', to: '/reports' },
    { label: 'Partners', to: '/team' },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'AJ';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-10">
          <NavLink to="/" className="flex items-center gap-2 group focus:outline-none">
            <CartSevenLogo size="md" lightMode={true} />
          </NavLink>

          {/* Clean Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'text-[#FF5500] bg-orange-50/70 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right Actions: Partner Profile & Logout */}
        <div className="flex items-center gap-3">
          <NavLink
            to="/team"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-[#FF5500] text-xs font-bold transition border border-slate-200"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{user?.name || 'AJMALSHA'}</span>
          </NavLink>
          <button
            onClick={() => logout()}
            title={`Logged in as ${user?.name || 'Partner'}. Click to logout.`}
            className="w-9 h-9 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center hover:opacity-90 transition cursor-pointer"
          >
            {getInitials(user?.name)}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Sub-nav */}
      <div className="lg:hidden bg-slate-50 border-t border-slate-200/60 px-6 py-2 flex items-center gap-2 overflow-x-auto text-xs">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `whitespace-nowrap px-3 py-1.5 rounded-lg font-semibold transition ${
                isActive ? 'bg-[#FF5500] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
};
