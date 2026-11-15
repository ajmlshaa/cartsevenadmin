import mongoose from 'mongoose';
import Voucher from '../models/Voucher.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { logAudit } from '../utils/auditHelper.js';
import { localStore, findAccount, applyBalanceChange } from '../utils/localStore.js';

export const getVouchers = async (req, res) => {
  try {
    const { type, collectionMethod, search } = req.query;

    let vouchers = [];

    if (mongoose.connection.readyState === 1) {
      try {
        let query = {};
        if (type && type !== 'all') {
          query.type = type;
        }
        if (collectionMethod && collectionMethod !== 'all') {
          query.collectionMethod = collectionMethod;
        }
        vouchers = await Voucher.find(query).sort({ createdAt: -1 });
      } catch (err) {
        vouchers = localStore.data.vouchers || [];
      }
    } else {
      vouchers = localStore.data.vouchers || [];
    }

    if (type && type !== 'all') {
      vouchers = vouchers.filter((v) => v.type === type);
    }
    if (collectionMethod && collectionMethod !== 'all') {
      vouchers = vouchers.filter((v) => v.collectionMethod === collectionMethod);
    }
    if (search) {
      const s = search.toLowerCase();
      vouchers = vouchers.filter(
        (v) =>
          (v.voucherNumber && v.voucherNumber.toLowerCase().includes(s)) ||
          (v.partyName && v.partyName.toLowerCase().includes(s)) ||
          (v.narration && v.narration.toLowerCase().includes(s)) ||
          (v.referenceNumber && v.referenceNumber.toLowerCase().includes(s))
      );
    }

    res.json({ success: true, count: vouchers.length, data: vouchers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
};

export const createVoucher = async (req, res) => {
  try {
    const {
      type,
      date,
      debitAccount,
      creditAccount,
      amount,
      collectionMethod,
      partyName,
      referenceNumber,
      narration,
    } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount greater than 0 is required' });
    }

    const prefixMap = {
      'Payment Voucher': 'PV',
      'Receipt Voucher': 'RV',
      'Sales Voucher': 'SV',
      'Purchase Voucher': 'PUV',
      'Contra Voucher': 'CV',
      'Journal Voucher': 'JV',
      'Credit Note': 'CN',
      'Debit Note': 'DN',
    };

    const prefix = prefixMap[type] || 'VCH';
    const rand = Math.floor(1000 + Math.random() * 9000);
    const voucherNumber = `${prefix}-2026-${rand}`;

    // Resolve Debit & Credit Accounts
    const debitAcc = findAccount(localStore.data.accounts, debitAccount);
    const creditAcc = findAccount(localStore.data.accounts, creditAccount);

    const debitAccName = debitAcc?.name || debitAccount || 'General Ledger';
    const debitAccCode = debitAcc?.code || '1020';
    const creditAccName = creditAcc?.name || creditAccount || 'General Ledger';
    const creditAccCode = creditAcc?.code || '2011';

    const newVoucher = {
      _id: 'v_' + Date.now(),
      voucherNumber,
      type,
      date: date || new Date().toISOString(),
      debitAccount: debitAccName,
      debitAccountCode: debitAccCode,
      creditAccount: creditAccName,
      creditAccountCode: creditAccCode,
      amount: numAmount,
      collectionMethod: collectionMethod || 'Direct Bank Transfer (NEFT/RTGS)',
      partyName: partyName || '',
      referenceNumber: referenceNumber || '',
      narration: narration || '',
      location: req.user?.location || 'Central Ledger',
      createdByName: req.user?.name || 'Administrator',
      status: 'posted',
      createdAt: new Date().toISOString(),
    };

    // Double-Entry Transactions (General Ledger Legs)
    const txnDate = newVoucher.date;
    const debitTxn = {
      _id: 'txn_' + Date.now() + '_dr',
      transactionNumber: `TXN-${voucherNumber}-DR`,
      date: txnDate,
      type: 'debit',
      accountCode: debitAccCode,
      accountName: debitAccName,
      debit: numAmount,
      credit: 0,
      description: `${type} #${voucherNumber} [Dr: ${debitAccName}] - ${partyName || ''} (${narration || 'Posted'})`,
      reference: voucherNumber,
      source: 'voucher',
      voucherId: newVoucher._id,
      createdBy: req.user?._id,
      createdByName: req.user?.name,
      location: req.user?.location,
      createdAt: new Date().toISOString(),
    };

    const creditTxn = {
      _id: 'txn_' + Date.now() + '_cr',
      transactionNumber: `TXN-${voucherNumber}-CR`,
      date: txnDate,
      type: 'credit',
      accountCode: creditAccCode,
      accountName: creditAccName,
      debit: 0,
      credit: numAmount,
      description: `${type} #${voucherNumber} [Cr: ${creditAccName}] - ${partyName || ''} (${narration || 'Posted'})`,
      reference: voucherNumber,
      source: 'voucher',
      voucherId: newVoucher._id,
      createdBy: req.user?._id,
      createdByName: req.user?.name,
      location: req.user?.location,
      createdAt: new Date().toISOString(),
    };

    // 1. Maintain in localStore & apply real-time double-entry balances
    localStore.data.vouchers.unshift(newVoucher);
    if (!localStore.data.transactions) localStore.data.transactions = [];
    localStore.data.transactions.unshift(debitTxn, creditTxn);

    if (debitAcc) applyBalanceChange(debitAcc, true, numAmount);
    if (creditAcc) applyBalanceChange(creditAcc, false, numAmount);
    localStore.save();

    // 2. If MongoDB Atlas is connected, persist to MongoDB
    if (mongoose.connection.readyState === 1) {
      try {
        const created = await Voucher.create(newVoucher);
        newVoucher._id = created._id;

        await Transaction.create([
          { ...debitTxn, voucherId: created._id },
          { ...creditTxn, voucherId: created._id },
        ]);

        if (debitAcc) {
          const isDrAsset = ['Asset', 'Expense'].includes(debitAcc.type);
          await Account.findOneAndUpdate(
            { code: debitAccCode },
            { $inc: { balance: isDrAsset ? numAmount : -numAmount } }
          );
        }

        if (creditAcc) {
          const isCrLiab = ['Liability', 'Equity', 'Revenue'].includes(creditAcc.type);
          await Account.findOneAndUpdate(
            { code: creditAccCode },
            { $inc: { balance: isCrLiab ? numAmount : -numAmount } }
          );
        }
      } catch (err) {
        console.warn('Voucher DB create failed, saved locally:', err.message);
      }
    }

    await logAudit({
      req,
      action: 'CREATE',
      entity: 'Voucher',
      entityId: newVoucher._id,
      details: `Created ${type} #${voucherNumber} for ₹ ${numAmount.toLocaleString('en-IN')} [Dr: ${debitAccName} -> Cr: ${creditAccName}]`,
    });

    return res.status(201).json({
      success: true,
      data: newVoucher,
      message: `Voucher #${voucherNumber} posted successfully with double-entry ledger update`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = localStore.data.vouchers.find((v) => String(v._id) === String(id));

    if (existing) {
      const debitAcc = findAccount(localStore.data.accounts, existing.debitAccount);
      const creditAcc = findAccount(localStore.data.accounts, existing.creditAccount);
      const numAmount = Number(existing.amount) || 0;

      // Revert balances
      if (debitAcc) applyBalanceChange(debitAcc, false, numAmount);
      if (creditAcc) applyBalanceChange(creditAcc, true, numAmount);

      // Remove associated transactions
      if (localStore.data.transactions) {
        localStore.data.transactions = localStore.data.transactions.filter(
          (t) => String(t.voucherId) !== String(id) && t.reference !== existing.voucherNumber
        );
      }

      localStore.data.vouchers = localStore.data.vouchers.filter((v) => String(v._id) !== String(id));
      localStore.save();

      if (mongoose.connection.readyState === 1) {
        try {
          await Voucher.findByIdAndDelete(id);
          await Transaction.deleteMany({
            $or: [{ voucherId: id }, { reference: existing.voucherNumber }],
          });

          if (debitAcc) {
            const isDrAsset = ['Asset', 'Expense'].includes(debitAcc.type);
            await Account.findOneAndUpdate(
              { code: debitAcc.code },
              { $inc: { balance: isDrAsset ? -numAmount : numAmount } }
            );
          }

          if (creditAcc) {
            const isCrLiab = ['Liability', 'Equity', 'Revenue'].includes(creditAcc.type);
            await Account.findOneAndUpdate(
              { code: creditAcc.code },
              { $inc: { balance: isCrLiab ? -numAmount : numAmount } }
            );
          }
        } catch {
          // ignore
        }
      }
    }

    await logAudit({
      req,
      action: 'DELETE',
      entity: 'Voucher',
      entityId: id,
      details: `Deleted voucher record ID ${id} and reversed double-entry ledger postings`,
    });

    res.json({ success: true, message: 'Voucher deleted and ledger balances reversed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
