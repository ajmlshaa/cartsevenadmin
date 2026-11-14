import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import { logAudit } from '../utils/auditHelper.js';
import { localStore } from '../utils/localStore.js';

// Generate unique invoice number
const generateInvoiceNumber = async () => {
  let count = 0;
  if (mongoose.connection.readyState === 1) {
    try {
      count = await Invoice.countDocuments();
    } catch {
      count = localStore.data.invoices.length;
    }
  } else {
    count = localStore.data.invoices.length;
  }
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Get all invoices
// @route   GET /api/invoices
export const getInvoices = async (req, res) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;

    let invoices = [];

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {};
        if (status && status !== 'all') {
          query.status = status;
        }
        if (search) {
          query.$or = [
            { invoiceNumber: { $regex: search, $options: 'i' } },
            { customerName: { $regex: search, $options: 'i' } },
            { customerEmail: { $regex: search, $options: 'i' } },
            { orderReference: { $regex: search, $options: 'i' } },
          ];
        }
        const total = await Invoice.countDocuments(query);
        invoices = await Invoice.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number(limit))
          .populate('createdBy', 'name email location');

        return res.json({
          success: true,
          total,
          page: Number(page),
          pages: Math.ceil(total / limit) || 1,
          data: invoices,
        });
      } catch (err) {
        invoices = localStore.data.invoices || [];
      }
    } else {
      invoices = localStore.data.invoices || [];
    }

    if (status && status !== 'all') {
      invoices = invoices.filter((inv) => inv.status === status);
    }

    if (search) {
      const s = search.toLowerCase();
      invoices = invoices.filter(
        (inv) =>
          (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(s)) ||
          (inv.customerName && inv.customerName.toLowerCase().includes(s)) ||
          (inv.customerEmail && inv.customerEmail.toLowerCase().includes(s)) ||
          (inv.orderReference && inv.orderReference.toLowerCase().includes(s))
      );
    }

    const total = invoices.length;
    const paginated = invoices.slice((page - 1) * limit, page * limit);

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

// @desc    Get single invoice
// @route   GET /api/invoices/:id
export const getInvoiceById = async (req, res) => {
  try {
    let invoice = null;
    if (mongoose.connection.readyState === 1) {
      try {
        invoice = await Invoice.findById(req.params.id).populate('createdBy', 'name email location');
      } catch {
        invoice = localStore.data.invoices.find((inv) => String(inv._id) === String(req.params.id));
      }
    } else {
      invoice = localStore.data.invoices.find((inv) => String(inv._id) === String(req.params.id));
    }

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
export const createInvoice = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      platform,
      orderReference,
      items,
      taxRate = 0,
      shippingFee = 0,
      discount = 0,
      status = 'pending',
      paymentMethod = 'Online Payment Gateway (Razorpay/Stripe)',
      issueDate,
      dueDate,
      notes,
    } = req.body;

    if (!customerName) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required' });
    }

    const processedItems = items.map((item) => ({
      sku: item.sku || '',
      description: item.description,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      amount: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
    }));

    const subtotal = processedItems.reduce((acc, item) => acc + item.amount, 0);
    const taxAmount = (subtotal * Number(taxRate)) / 100;
    const totalAmount = Math.max(0, subtotal + taxAmount + Number(shippingFee) - Number(discount));
    const amountPaid = status === 'paid' ? totalAmount : 0;
    const balanceDue = totalAmount - amountPaid;

    const invoiceNumber = req.body.invoiceNumber || (await generateInvoiceNumber());

    const newInvoice = {
      _id: 'inv_' + Date.now(),
      invoiceNumber,
      customerName,
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      customerAddress: customerAddress || '',
      platform: platform || 'Direct Website',
      orderReference: orderReference || '',
      items: processedItems,
      subtotal,
      taxRate: Number(taxRate),
      taxAmount,
      shippingFee: Number(shippingFee),
      discount: Number(discount),
      totalAmount,
      amountPaid,
      balanceDue,
      status,
      paymentMethod,
      issueDate: issueDate || new Date().toISOString(),
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      paidAt: status === 'paid' ? new Date().toISOString() : null,
      notes: notes || '',
      createdBy: req.user?._id || 'user_admin',
      createdByName: req.user?.name || 'Administrator',
      location: req.user?.location || 'Store Main',
      createdAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const created = await Invoice.create(newInvoice);
        newInvoice._id = created._id;

        await Transaction.create({
          transactionNumber: `TXN-${Date.now().toString().slice(-6)}`,
          date: newInvoice.issueDate,
          type: 'income',
          accountCode: '3010',
          accountName: 'Product Sales Account',
          credit: totalAmount,
          description: `Invoice ${newInvoice.invoiceNumber} - ${customerName}`,
          reference: newInvoice.invoiceNumber,
          source: 'sales_invoice',
          createdBy: req.user?._id,
          createdByName: req.user?.name,
          location: req.user?.location,
        });

        await Account.findOneAndUpdate(
          { code: '3010' },
          { $inc: { balance: totalAmount } }
        );
      } catch (err) {
        console.warn('DB create failed for invoice, stored locally:', err.message);
      }
    }

    // Always maintain in localStore
    localStore.data.invoices.unshift(newInvoice);
    const salesAcc = localStore.data.accounts.find((a) => a.code === '3010');
    if (salesAcc) {
      salesAcc.balance = (salesAcc.balance || 0) + totalAmount;
    }
    localStore.save();

    await logAudit({
      req,
      action: 'CREATE',
      entity: 'Invoice',
      entityId: newInvoice._id,
      details: `Created invoice ${newInvoice.invoiceNumber} for ${customerName} (₹ ${totalAmount.toLocaleString('en-IN')})`,
    });

    res.status(201).json({ success: true, data: newInvoice });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update invoice status / record payment
// @route   PUT /api/invoices/:id/payment
export const recordPayment = async (req, res) => {
  try {
    const { amountPaid, paymentMethod } = req.body;
    let invoice = null;

    if (mongoose.connection.readyState === 1) {
      try {
        invoice = await Invoice.findById(req.params.id);
      } catch {
        // fallback
      }
    }

    if (!invoice) {
      invoice = localStore.data.invoices.find((inv) => String(inv._id) === String(req.params.id));
    }

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const payAmount = Number(amountPaid) || invoice.balanceDue;
    invoice.amountPaid = (invoice.amountPaid || 0) + payAmount;
    invoice.balanceDue = Math.max(0, invoice.totalAmount - invoice.amountPaid);

    if (invoice.balanceDue === 0) {
      invoice.status = 'paid';
      invoice.paidAt = new Date().toISOString();
    } else {
      invoice.status = 'partially_paid';
    }

    if (paymentMethod) {
      invoice.paymentMethod = paymentMethod;
    }

    if (invoice.save) {
      await invoice.save();
    }

    localStore.save();

    await logAudit({
      req,
      action: 'PAYMENT_RECORDED',
      entity: 'Invoice',
      entityId: invoice._id,
      details: `Recorded payment of ₹ ${payAmount.toLocaleString('en-IN')} on invoice ${invoice.invoiceNumber}. New status: ${invoice.status}`,
    });

    res.json({ success: true, data: invoice, message: 'Payment recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
export const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      try {
        await Invoice.findByIdAndDelete(id);
      } catch {
        // ignore
      }
    }

    localStore.data.invoices = localStore.data.invoices.filter((inv) => String(inv._id) !== String(id));
    localStore.save();

    await logAudit({
      req,
      action: 'DELETE',
      entity: 'Invoice',
      entityId: id,
      details: `Deleted invoice record ID ${id}`,
    });

    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
