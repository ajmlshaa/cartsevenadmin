import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import { logAudit } from '../utils/auditHelper.js';
import { localStore } from '../utils/localStore.js';

const generateExpenseNumber = async () => {
  let count = 0;
  if (mongoose.connection.readyState === 1) {
    try {
      count = await Expense.countDocuments();
    } catch {
      count = localStore.data.expenses.length;
    }
  } else {
    count = localStore.data.expenses.length;
  }
  const year = new Date().getFullYear();
  return `EXP-${year}-${String(count + 1).padStart(4, '0')}`;
};

export const getExpenses = async (req, res) => {
  try {
    const { category, search, limit = 50, page = 1 } = req.query;

    let expenses = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {};
        if (category && category !== 'all') {
          query.category = category;
        }
        if (search) {
          query.$or = [
            { expenseNumber: { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } },
            { vendor: { $regex: search, $options: 'i' } },
          ];
        }
        const total = await Expense.countDocuments(query);
        expenses = await Expense.find(query)
          .sort({ date: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number(limit))
          .populate('createdBy', 'name email location');

        return res.json({
          success: true,
          total,
          page: Number(page),
          pages: Math.ceil(total / limit) || 1,
          data: expenses,
        });
      } catch (err) {
        expenses = localStore.data.expenses || [];
      }
    } else {
      expenses = localStore.data.expenses || [];
    }

    if (category && category !== 'all') {
      expenses = expenses.filter((e) => e.category === category);
    }

    if (search) {
      const s = search.toLowerCase();
      expenses = expenses.filter(
        (e) =>
          (e.expenseNumber && e.expenseNumber.toLowerCase().includes(s)) ||
          (e.title && e.title.toLowerCase().includes(s)) ||
          (e.vendor && e.vendor.toLowerCase().includes(s))
      );
    }

    const total = expenses.length;
    const paginated = expenses.slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit) || 1,
      data: paginated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: [] });
  }
};

export const createExpense = async (req, res) => {
  try {
    const {
      title,
      category,
      amount,
      taxAmount = 0,
      paymentMethod = 'Corporate Card',
      vendor,
      date,
      reference,
      notes,
    } = req.body;

    if (!title || !category || !amount || !vendor) {
      return res.status(400).json({ success: false, message: 'Title, category, amount, and vendor are required' });
    }

    const expenseNumber = await generateExpenseNumber();

    const newExpense = {
      _id: 'exp_' + Date.now(),
      expenseNumber,
      title,
      category,
      amount: Number(amount),
      taxAmount: Number(taxAmount),
      paymentMethod,
      vendor,
      date: date || new Date().toISOString().split('T')[0],
      reference: reference || '',
      notes: notes || '',
      createdBy: req.user?._id || 'user_admin',
      createdByName: req.user?.name || 'Administrator',
      location: req.user?.location || 'Store Main',
      createdAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const created = await Expense.create(newExpense);
        newExpense._id = created._id;

        await Transaction.create({
          transactionNumber: `TXN-${Date.now().toString().slice(-6)}`,
          date: newExpense.date,
          type: 'expense',
          accountCode: '5010',
          accountName: category,
          debit: Number(amount),
          description: `${newExpense.expenseNumber} - ${title} (${vendor})`,
          reference: newExpense.expenseNumber,
          source: 'expense_bill',
          createdBy: req.user?._id,
          createdByName: req.user?.name,
          location: req.user?.location,
        });
      } catch (err) {
        console.warn('Expense DB create failed, saving to local store:', err.message);
      }
    }

    localStore.data.expenses.unshift(newExpense);
    localStore.save();

    await logAudit({
      req,
      action: 'CREATE',
      entity: 'Expense',
      entityId: newExpense._id,
      details: `Logged expense ${newExpense.expenseNumber} - ${title} (₹ ${Number(amount).toLocaleString('en-IN')})`,
    });

    res.status(201).json({ success: true, data: newExpense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      try {
        await Expense.findByIdAndDelete(id);
      } catch {
        // ignore
      }
    }

    localStore.data.expenses = localStore.data.expenses.filter((e) => String(e._id) !== String(id));
    localStore.save();

    await logAudit({
      req,
      action: 'DELETE',
      entity: 'Expense',
      entityId: id,
      details: `Deleted expense ID ${id}`,
    });

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
