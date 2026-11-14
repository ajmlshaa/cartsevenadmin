import mongoose from 'mongoose';
import Voucher from '../models/Voucher.js';
import { logAudit } from '../utils/auditHelper.js';
import { localStore } from '../utils/localStore.js';

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

    const newVoucher = {
      _id: 'v_' + Date.now(),
      voucherNumber,
      type,
      date: date || new Date().toISOString(),
      debitAccount: debitAccount || '',
      creditAccount: creditAccount || '',
      amount: Number(amount),
      collectionMethod: collectionMethod || 'Direct Bank Transfer (NEFT/RTGS)',
      partyName: partyName || '',
      referenceNumber: referenceNumber || '',
      narration: narration || '',
      location: req.user?.location || 'Central Ledger',
      createdByName: req.user?.name || 'Administrator',
      status: 'posted',
      createdAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const created = await Voucher.create(newVoucher);
        newVoucher._id = created._id;
      } catch (err) {
        console.warn('Voucher DB create failed, saving to local store:', err.message);
      }
    }

    // Always maintain in localStore
    localStore.data.vouchers.unshift(newVoucher);
    localStore.save();

    await logAudit({
      req,
      action: 'CREATE',
      entity: 'Voucher',
      entityId: newVoucher._id,
      details: `Created ${type} #${voucherNumber} for ₹ ${Number(amount).toLocaleString('en-IN')}`,
    });

    return res.status(201).json({ success: true, data: newVoucher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      try {
        await Voucher.findByIdAndDelete(id);
      } catch (err) {
        // ignore
      }
    }

    localStore.data.vouchers = localStore.data.vouchers.filter((v) => String(v._id) !== String(id));
    localStore.save();

    await logAudit({
      req,
      action: 'DELETE',
      entity: 'Voucher',
      entityId: id,
      details: `Deleted voucher record ID ${id}`,
    });

    res.json({ success: true, message: 'Voucher deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
