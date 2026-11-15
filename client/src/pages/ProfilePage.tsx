import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Building,
  Save,
  LogOut,
  Clock,
  Laptop,
  Check,
  Bell,
  Coins,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { request } from '../services/api';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98201 44891');
  const [location, setLocation] = useState(user?.location || 'Central Office');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Preference Toggles
  const [notifyInvoices, setNotifyInvoices] = useState(true);
  const [notifyExpenses, setNotifyExpenses] = useState(true);
  const [notifyAudit, setNotifyAudit] = useState(false);

  // Logout Modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const getInitials = (nameStr?: string) => {
    if (!nameStr) return 'P';
    const parts = nameStr.trim().split(/\s+/);
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setIsSavingProfile(true);

    try {
      const ok = await updateProfile({ name, phone, location });
      if (ok) {
        setProfileSuccess('Profile information updated successfully.');
        setTimeout(() => setProfileSuccess(''), 4000);
      } else {
        setProfileError('Failed to save profile changes. Please try again.');
      }
    } catch (err: any) {
      setProfileError(err.message || 'Error updating profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setIsChangingPassword(true);

    try {
      await request('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Current password was incorrect.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0A1931] tracking-tight">
            My Profile & Partner Settings
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your personal partner information, security credentials, and system preferences.
          </p>
        </div>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4 stroke-[2.2]" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#FF5500] to-[#FF8844] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-500/20 shrink-0">
              {getInitials(user?.name)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-[#0A1931]">
                  {user?.name || 'Partner'}
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-orange-50 text-[#FF5500] border border-orange-200">
                  {getRoleTitle(user?.role)}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Active Partner
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-mono">
                {user?.email || 'partner@cartseven.com'}
              </p>
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-2 pt-0.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>CartSeven E-Commerce Corp • {user?.location || 'Central Office'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Personal Info & Security */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Personal Details Form */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.05)] space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF5500]">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#0A1931] text-base">
                  Personal Information
                </h3>
                <p className="text-xs text-slate-500">
                  Your identity across audit logs, invoices, and voucher approvals.
                </p>
              </div>
            </div>

            {profileSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-bold">{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Email Address <span className="text-slate-400 font-normal">(Verified Partner ID)</span>
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Branch / Operating Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md shadow-orange-500/20 active:scale-[0.98] transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingProfile ? 'Saving...' : 'Save Profile Details'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Security & Password Settings */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.05)] space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF5500]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#0A1931] text-base">
                  Security & Password
                </h3>
                <p className="text-xs text-slate-500">
                  Update your partner authentication credentials.
                </p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-bold">{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#FAFAFB] border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#FF5500] focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-[#0A1931] hover:bg-[#142646] text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md active:scale-[0.98] transition flex items-center gap-2 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span>{isChangingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (4 cols): Roles, Preferences, and Session */}
        <div className="lg:col-span-4 space-y-8">
          {/* Partner Privileges */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Shield className="w-4 h-4 text-[#FF5500]" />
              <h3 className="font-extrabold text-[#0A1931] text-sm">
                Assigned Authority
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Double-entry general ledger & balance sheet access</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Partner Capital & Drawings Account authority</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>GST / Tax invoicing and audit trail logging</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Multi-branch financial consolidation</span>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Bell className="w-4 h-4 text-[#FF5500]" />
              <h3 className="font-extrabold text-[#0A1931] text-sm">
                Alert Preferences
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 font-medium">New Invoice Notifications</span>
                <input
                  type="checkbox"
                  checked={notifyInvoices}
                  onChange={(e) => setNotifyInvoices(e.target.checked)}
                  className="rounded text-[#FF5500] focus:ring-[#FF5500]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 font-medium">High Value Expense Approvals</span>
                <input
                  type="checkbox"
                  checked={notifyExpenses}
                  onChange={(e) => setNotifyExpenses(e.target.checked)}
                  className="rounded text-[#FF5500] focus:ring-[#FF5500]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 font-medium">Security & Audit Alerts</span>
                <input
                  type="checkbox"
                  checked={notifyAudit}
                  onChange={(e) => setNotifyAudit(e.target.checked)}
                  className="rounded text-[#FF5500] focus:ring-[#FF5500]"
                />
              </label>
            </div>
          </div>

          {/* Active Session Info */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Laptop className="w-4 h-4 text-[#FF5500]" />
              <h3 className="font-extrabold text-[#0A1931] text-sm">
                Active Session
              </h3>
            </div>

            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span>Security Token:</span>
                <span className="font-mono text-emerald-600 font-bold">Valid (JWT)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Currency Engine:</span>
                <span className="font-bold text-slate-800">INR (₹)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Access Window:</span>
                <span className="text-slate-700">7 Days Auto-Renew</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs py-2.5 rounded-full transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-[#0A1931]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[#0A1931]">
                Sign Out of CartSeven?
              </h3>
              <p className="text-xs text-slate-500">
                You will be signed out and redirected back to the secure partner portal.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-full transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-full transition cursor-pointer shadow-md shadow-rose-600/20"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
