import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Settings as SettingsIcon,
  Users as UsersIcon,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CartSevenLogo } from './CartSevenLogo';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { label: 'Dashboard', to: '/' },
    { label: 'Vouchers', to: '/vouchers' },
    { label: 'Invoices', to: '/invoices' },
    { label: 'Expenses', to: '/expenses' },
    { label: 'Registers', to: '/registers' },
    { label: 'Ledgers', to: '/accounts' },
    { label: 'Reports', to: '/reports' },
    { label: 'Partners', to: '/team' },
    { label: 'Profile', to: '/profile' },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'AJ';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const getRoleTitle = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Managing Partner';
      case 'accountant':
        return 'Finance Partner';
      case 'manager':
        return 'Operations Partner';
      default:
        return 'Authorized Partner';
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-8">
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
                  `text-sm font-semibold px-3 py-2 rounded-xl transition-colors ${
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

        {/* Right Actions: Partner Profile & Menu */}
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          {/* Quick Profile Link */}
          <NavLink
            to="/profile"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-[#FF5500] text-xs font-bold transition border border-slate-200"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{user?.name || 'AJMALSHA'}</span>
          </NavLink>

          {/* Avatar Menu Button */}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center hover:opacity-90 transition cursor-pointer shadow-sm relative"
            title="Account & Profile Settings"
          >
            {getInitials(user?.name)}
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User Header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="font-extrabold text-sm text-[#0A1931] truncate">
                  {user?.name || 'Partner'}
                </div>
                <div className="text-[11px] font-mono text-slate-500 truncate">
                  {user?.email || 'partner@cartseven.com'}
                </div>
                <div className="mt-1.5">
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-[#FF5500] border border-orange-200">
                    {getRoleTitle(user?.role)}
                  </span>
                </div>
              </div>

              {/* Menu Links */}
              <div className="py-1 text-xs">
                <NavLink
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:text-[#FF5500] hover:bg-orange-50/50 transition font-medium"
                >
                  <UserIcon className="w-4 h-4 text-[#FF5500]" />
                  <span>My Profile Settings</span>
                </NavLink>

                <NavLink
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:text-[#FF5500] hover:bg-orange-50/50 transition font-medium"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  <span>Organization Settings</span>
                </NavLink>

                <NavLink
                  to="/team"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:text-[#FF5500] hover:bg-orange-50/50 transition font-medium"
                >
                  <UsersIcon className="w-4 h-4 text-slate-400" />
                  <span>Partners Directory</span>
                </NavLink>
              </div>

              {/* Divider & Explicit Logout */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 stroke-[2.2]" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
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
