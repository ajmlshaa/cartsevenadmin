import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { Navbar } from './components/Navbar';

import { PublicRedirect } from './pages/PublicRedirect';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Vouchers } from './pages/Vouchers';
import { Invoices } from './pages/Invoices';
import { InvoiceDetail } from './pages/InvoiceDetail';
import { Expenses } from './pages/Expenses';
import { Registers } from './pages/Registers';
import { ChartOfAccounts } from './pages/ChartOfAccounts';
import { Reports } from './pages/Reports';
import { TeamUsers } from './pages/TeamUsers';
import { AuditLogs } from './pages/AuditLogs';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';

const ProtectedLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-xs text-slate-700">Loading CartSeven Accounting Workspace...</span>
        </div>
      </div>
    );
  }

  // If anyone comes to this site without authenticated partner credentials, show the redirect page to https://cartseven.com/
  if (!user) {
    return <PublicRedirect />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB] text-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vouchers" element={<Vouchers />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/registers" element={<Registers />} />
          <Route path="/accounts" element={<ChartOfAccounts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/team" element={<TeamUsers />} />
          <Route path="/audit" element={<AuditLogs />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/portal" element={<PublicRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </CurrencyProvider>
    </AuthProvider>
  );
};

export default App;
