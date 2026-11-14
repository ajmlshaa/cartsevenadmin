import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Expense from '../models/Expense.js';
import Account from '../models/Account.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import { localStore } from '../utils/localStore.js';

export const getDashboardSummary = async (req, res) => {
  try {
    let invoices = [];
    let expenses = [];
    let accounts = [];
    let auditLogs = [];
    let users = [];

    if (mongoose.connection.readyState === 1) {
      try {
        invoices = await Invoice.find();
        expenses = await Expense.find();
        accounts = await Account.find();
        auditLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(8);
        users = await User.find({ isActive: true }).select('name email role location lastLogin');
      } catch (err) {
        invoices = localStore.data.invoices;
        expenses = localStore.data.expenses;
        accounts = localStore.data.accounts;
        auditLogs = localStore.data.auditLogs;
        users = localStore.data.users;
      }
    } else {
      invoices = localStore.data.invoices;
      expenses = localStore.data.expenses;
      accounts = localStore.data.accounts;
      auditLogs = localStore.data.auditLogs;
      users = localStore.data.users;
    }

    // 1. Total Net Revenue (from paid and partially paid invoices)
    const paidInvoices = invoices.filter((inv) => inv.status === 'paid' || inv.status === 'partially_paid');
    const totalRevenue = paidInvoices.reduce((acc, inv) => acc + (inv.amountPaid || inv.totalAmount || 0), 0);

    // 2. Pending Invoices (Accounts Receivable)
    const pendingInvoices = invoices.filter((inv) => inv.status === 'pending' || inv.status === 'partially_paid' || inv.status === 'overdue');
    const totalReceivables = pendingInvoices.reduce((acc, inv) => acc + (inv.balanceDue !== undefined ? inv.balanceDue : (inv.totalAmount - (inv.amountPaid || 0))), 0);

    // 3. Total Expenses
    const totalExpenses = expenses.reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0);

    // 4. Net Profit & Margin
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    // 5. Total Cash & Bank Accounts (Codes 1010 and 1020)
    const cashAcc = accounts.find((a) => a.code === '1010');
    const bankAcc = accounts.find((a) => a.code === '1020');
    const cashOnHand = (cashAcc?.balance || 0) + (bankAcc?.balance || 0);

    // 6. Clearing Accounts Balances
    const codAcc = accounts.find((a) => a.code === '1030');
    const gatewayAcc = accounts.find((a) => a.code === '1040');
    const marketplaceAcc = accounts.find((a) => a.code === '1050');
    const refundAcc = accounts.find((a) => a.code === '2070');

    // 7. Expense Category Breakdown for Chart
    const expenseCategoryMap = {};
    expenses.forEach((exp) => {
      const cat = exp.category || 'Other';
      expenseCategoryMap[cat] = (expenseCategoryMap[cat] || 0) + Number(exp.amount);
    });
    const expenseBreakdown = Object.entries(expenseCategoryMap).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }));

    // 8. Monthly Performance (Last 6 Months)
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      const monthInvoices = paidInvoices.filter((inv) => {
        const invDate = new Date(inv.issueDate || inv.createdAt);
        return invDate >= d && invDate < nextMonth;
      });
      const monthRev = monthInvoices.reduce((sum, inv) => sum + (inv.amountPaid || inv.totalAmount || 0), 0);

      const monthExpenses = expenses.filter((exp) => {
        const expDate = new Date(exp.date || exp.createdAt);
        return expDate >= d && expDate < nextMonth;
      });
      const monthExp = monthExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

      months.push({
        month: `${monthLabel} ${year}`,
        shortMonth: monthLabel,
        revenue: Math.round(monthRev),
        expenditure: Math.round(monthExp),
        profit: Math.round(monthRev - monthExp),
      });
    }

    // 9. Recent 5 Invoices
    const recentInvoices = invoices.slice(0, 5);

    // 10. Recent 5 Expenses
    const recentExpenses = expenses.slice(0, 5);

    // 11. Recent Team Audit Activity
    const recentActivities = auditLogs.slice(0, 8);

    res.json({
      success: true,
      data: {
        kpi: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalExpenses: Math.round(totalExpenses * 100) / 100,
          netProfit: Math.round(netProfit * 100) / 100,
          profitMargin: Number(profitMargin),
          totalReceivables: Math.round(totalReceivables * 100) / 100,
          cashOnHand: Math.round(cashOnHand * 100) / 100,
          totalInvoicesCount: invoices.length,
          totalExpensesCount: expenses.length,
        },
        clearingAccounts: {
          codReceivable: codAcc?.balance || 0,
          paymentGatewayClearing: gatewayAcc?.balance || 0,
          marketplaceClearing: marketplaceAcc?.balance || 0,
          customerRefunds: refundAcc?.balance || 0,
        },
        monthlyTrend: months,
        expenseBreakdown,
        recentInvoices,
        recentExpenses,
        activeUsers: users,
        recentActivities,
      },
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard metrics' });
  }
};
