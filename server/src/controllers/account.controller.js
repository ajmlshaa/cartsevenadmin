import mongoose from 'mongoose';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { logAudit } from '../utils/auditHelper.js';
import { localStore } from '../utils/localStore.js';

export const getAccounts = async (req, res) => {
  try {
    let accounts = [];

    if (mongoose.connection.readyState === 1) {
      try {
        accounts = await Account.find().sort({ code: 1 });
      } catch {
        accounts = localStore.data.accounts || [];
      }
    } else {
      accounts = localStore.data.accounts || [];
    }

    // Group by type for clean accounting categorization
    const grouped = {
      Asset: accounts.filter((a) => a.type === 'Asset'),
      Liability: accounts.filter((a) => a.type === 'Liability'),
      Equity: accounts.filter((a) => a.type === 'Equity'),
      Revenue: accounts.filter((a) => a.type === 'Revenue'),
      Expense: accounts.filter((a) => a.type === 'Expense'),
    };

    res.json({ success: true, data: accounts, grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAccount = async (req, res) => {
  try {
    const { code, name, type, subType, balance = 0, description } = req.body;

    const existing = localStore.data.accounts.find((a) => a.code === code);
    if (existing) {
      return res.status(400).json({ success: false, message: `Account code ${code} already exists` });
    }

    const newAccount = {
      _id: 'acc_' + Date.now(),
      code,
      name,
      type,
      subType: subType || 'General Account',
      balance: Number(balance) || 0,
      currency: 'INR',
      description: description || '',
      createdAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const created = await Account.create(newAccount);
        newAccount._id = created._id;
      } catch (err) {
        console.warn('Account DB create failed, saving locally:', err.message);
      }
    }

    localStore.data.accounts.push(newAccount);
    localStore.save();

    await logAudit({
      req,
      action: 'CREATE',
      entity: 'Account',
      entityId: newAccount._id,
      details: `Created GL Account ${code} - ${name} (${type})`,
    });

    res.status(201).json({ success: true, data: newAccount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { type, search, limit = 100, page = 1 } = req.query;

    let transactions = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {};
        if (type && type !== 'all') {
          query.type = type;
        }
        if (search) {
          query.$or = [
            { transactionNumber: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { reference: { $regex: search, $options: 'i' } },
          ];
        }
        const total = await Transaction.countDocuments(query);
        transactions = await Transaction.find(query)
          .sort({ date: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number(limit));

        return res.json({
          success: true,
          total,
          page: Number(page),
          pages: Math.ceil(total / limit) || 1,
          data: transactions,
        });
      } catch {
        transactions = localStore.data.transactions || [];
      }
    } else {
      transactions = localStore.data.transactions || [];
    }

    if (type && type !== 'all') {
      transactions = transactions.filter((t) => t.type === type);
    }
    if (search) {
      const s = search.toLowerCase();
      transactions = transactions.filter(
        (t) =>
          (t.transactionNumber && t.transactionNumber.toLowerCase().includes(s)) ||
          (t.description && t.description.toLowerCase().includes(s)) ||
          (t.reference && t.reference.toLowerCase().includes(s))
      );
    }

    const total = transactions.length;
    const paginated = transactions.slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit) || 1,
      data: paginated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
