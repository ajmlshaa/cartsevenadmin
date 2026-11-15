import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  Users2,
  FileCheck2,
  Search,
  MoreHorizontal,
  LogOut,
  MapPin,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CartSevenLogo } from './CartSevenLogo';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', to: '/', icon: Home },
    { label: 'Bank', to: '/accounts', icon: Landmark },
    { label: 'Income', to: '/invoices', icon: ArrowDownLeft },
    { label: 'Expenses', to: '/expenses', icon: ArrowUpRight },
    { label: 'Clients', to: '/team', icon: Users2 },
    { label: 'Taxes', to: '/reports', icon: FileCheck2 },
    { label: 'Audit Trail', to: '/audit', icon: ShieldCheck },
  ];

  return (
    <aside className="w-60 bg-[#121316] border-r border-[#1F2128] flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto select-none p-4">
      {/* Top Header & Navigation */}
      <div className="space-y-6">
        {/* Brand Logo matching Figma */}
        <div className="px-1 pt-1">
          <CartSevenLogo size="md" />
        </div>

        {/* Search Bar with ⌘ S shortcut matching Figma design */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            className="w-full bg-[#1A1B20] border border-[#262832] rounded-xl pl-8 pr-10 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-400 transition"
          />
          <span className="absolute right-2.5 top-2 bg-[#262832] text-slate-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#333644]">
            ⌘ S
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) =>
                  isActive
                    ? { backgroundColor: theme.primary, color: '#FFFFFF' }
                    : undefined
                }
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'shadow-lg text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1A1B20]'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition ${
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile Block */}
      <div className="space-y-4 pt-4">
        {/* User Profile Card matching Figma layout */}
        <div
          onClick={() => navigate('/profile')}
          className="bg-[#1A1B20] border border-[#262832] hover:border-[#383A48] rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              style={{ backgroundColor: theme.primary }}
              className="w-8 h-8 rounded-lg text-white font-extrabold text-xs flex items-center justify-center shrink-0"
            >
              {user ? user.name.split(' ').map((n) => n[0]).join('') : 'DV'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {user?.name || 'Partner'}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {user?.role === 'admin' ? 'Managing Partner' : user?.role === 'accountant' ? 'Finance Partner' : 'Operations Partner'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/profile');
              }}
              title="My Profile Settings"
              className="p-1 hover:text-white transition"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
