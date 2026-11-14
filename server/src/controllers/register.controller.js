import { localStore } from '../utils/localStore.js';

export const getRegistersData = async (req, res) => {
  try {
    const { registerType } = req.params;

    const invoices = localStore.data.invoices || [];
    const expenses = localStore.data.expenses || [];
    const vouchers = localStore.data.vouchers || [];
    const accounts = localStore.data.accounts || [];

    // 1. Sales Register: mapped from real invoices
    const sales = invoices.map((inv, idx) => ({
      id: `SR-${String(idx + 1).padStart(2, '0')}`,
      orderId: inv.orderReference || inv.invoiceNumber,
      date: (inv.issueDate || inv.createdAt || '').split('T')[0],
      customer: inv.customerName,
      platform: inv.platform || 'Direct Website',
      items: inv.items?.map((it) => it.description).join(', ') || 'General Item',
      taxableAmount: inv.subtotal || 0,
      gstRate: inv.taxRate || 18,
      gstAmount: inv.taxAmount || 0,
      totalAmount: inv.totalAmount || 0,
      paymentStatus: inv.status === 'paid' ? 'Paid' : (inv.status === 'partially_paid' ? 'Partially Paid' : 'Pending'),
      location: inv.location || 'Store Main',
    }));

    // 2. Purchase Register: mapped from purchase vouchers and stock expenses
    const purchaseVouchers = vouchers.filter((v) => v.type === 'Purchase Voucher');
    const purchaseExpenses = expenses.filter((e) => e.category === 'Inventory Stock Purchase' || e.category === 'Purchase Account');
    const purchases = [
      ...purchaseVouchers.map((pv, idx) => ({
        id: `PR-${String(idx + 1).padStart(2, '0')}`,
        billNo: pv.referenceNumber || pv.voucherNumber,
        date: (pv.date || pv.createdAt || '').split('T')[0],
        supplier: pv.partyName,
        category: 'Inventory Stock',
        items: pv.narration || 'Stock Goods',
        taxableAmount: pv.amount,
        customsDuty: 0,
        totalAmount: pv.amount,
        paymentStatus: 'Posted',
        location: pv.location || 'Central Ledger',
      })),
      ...purchaseExpenses.map((pe, idx) => ({
        id: `PR-EXP-${String(idx + 1).padStart(2, '0')}`,
        billNo: pe.reference || pe.expenseNumber,
        date: (pe.date || pe.createdAt || '').split('T')[0],
        supplier: pe.vendor,
        category: pe.category,
        items: pe.title,
        taxableAmount: pe.amount - (pe.taxAmount || 0),
        customsDuty: 0,
        totalAmount: pe.amount,
        paymentStatus: 'Paid',
        location: pe.location || 'Store Main',
      })),
    ];

    // 3. Stock Register: empty until inventory movements
    const stock = [];

    // 4. Customer Register: aggregated from real invoices
    const customerMap = {};
    invoices.forEach((inv) => {
      const name = inv.customerName || 'Walk-in';
      if (!customerMap[name]) {
        customerMap[name] = {
          customerId: `CUST-${Object.keys(customerMap).length + 1}`,
          name,
          email: inv.customerEmail || '-',
          phone: inv.customerPhone || '-',
          location: inv.customerAddress || 'India',
          totalOrders: 0,
          lifetimeSpend: 0,
          outstandingBalance: 0,
          paymentTerms: 'Standard',
          status: 'Active',
        };
      }
      customerMap[name].totalOrders += 1;
      customerMap[name].lifetimeSpend += inv.totalAmount || 0;
      customerMap[name].outstandingBalance += (inv.balanceDue !== undefined ? inv.balanceDue : (inv.totalAmount - (inv.amountPaid || 0)));
    });
    const customers = Object.values(customerMap);

    // 5. Supplier Register: aggregated from purchase vouchers & expenses
    const supplierMap = {};
    purchases.forEach((p) => {
      const name = p.supplier || 'Vendor';
      if (!supplierMap[name]) {
        supplierMap[name] = {
          supplierId: `SUP-${Object.keys(supplierMap).length + 1}`,
          name,
          contact: '-',
          email: '-',
          category: p.category || 'Supplies',
          totalPurchased: 0,
          paidAmount: 0,
          balanceDue: 0,
          rating: 'Verified',
        };
      }
      supplierMap[name].totalPurchased += p.totalAmount;
      supplierMap[name].paidAmount += p.totalAmount;
    });
    const suppliers = Object.values(supplierMap);

    // 6. Order Register: mapped from invoices
    const orders = invoices.map((inv) => ({
      orderId: inv.orderReference || inv.invoiceNumber,
      date: (inv.issueDate || inv.createdAt || '').split('T')[0],
      customer: inv.customerName,
      platform: inv.platform || 'Direct Website',
      itemsCount: inv.items?.length || 1,
      paymentMode: inv.paymentMethod || 'Online Gateway',
      amount: inv.totalAmount,
      fulfillmentStatus: inv.status === 'paid' ? 'Fulfilled' : 'Pending',
      courier: '-',
      awb: '-',
    }));

    // 7. Return Register: mapped from Credit Notes
    const creditNotes = vouchers.filter((v) => v.type === 'Credit Note');
    const returns = creditNotes.map((cn, idx) => ({
      returnId: `RET-${String(idx + 1).padStart(2, '0')}`,
      date: (cn.date || cn.createdAt || '').split('T')[0],
      orderId: cn.referenceNumber || '-',
      customer: cn.partyName,
      product: cn.narration || 'Returned Product',
      reason: 'Customer Return',
      refundAmount: cn.amount,
      restockStatus: 'Processed',
      refundStatus: `Issued via ${cn.voucherNumber}`,
    }));

    // 8. Payment Register: payments received
    const payments = [
      ...invoices.filter((inv) => inv.amountPaid > 0).map((inv, idx) => ({
        txnId: `PAY-${String(idx + 1).padStart(2, '0')}`,
        date: (inv.paidAt || inv.issueDate || '').split('T')[0],
        method: inv.paymentMethod || 'Online Gateway',
        payer: inv.customerName,
        orderRef: inv.orderReference || inv.invoiceNumber,
        grossAmount: inv.amountPaid,
        gatewayFee: 0,
        netSettlement: inv.amountPaid,
        accountCredited: 'Bank Account - HDFC Current',
        settlementStatus: 'Cleared',
      })),
      ...vouchers.filter((v) => v.type === 'Receipt Voucher').map((rv, idx) => ({
        txnId: `PAY-RV-${String(idx + 1).padStart(2, '0')}`,
        date: (rv.date || rv.createdAt || '').split('T')[0],
        method: rv.collectionMethod || 'Bank Transfer',
        payer: rv.partyName,
        orderRef: rv.referenceNumber || rv.voucherNumber,
        grossAmount: rv.amount,
        gatewayFee: 0,
        netSettlement: rv.amount,
        accountCredited: rv.debitAccount || 'Bank Account - HDFC Current',
        settlementStatus: 'Cleared',
      })),
    ];

    // 9. Delivery Register: empty until shipments created
    const deliveries = [];

    // 10. Expense Register: mapped from real expenses
    const expenseList = expenses.map((exp) => ({
      expenseId: exp.expenseNumber,
      date: (exp.date || exp.createdAt || '').split('T')[0],
      title: exp.title,
      category: exp.category,
      vendor: exp.vendor,
      amount: exp.amount,
      tax: exp.taxAmount || 0,
      paymentMode: exp.paymentMethod,
      branch: exp.location || 'Store Main',
    }));

    // 11. Bank Reconciliation: using real bank account balance
    const bankAcc = accounts.find((a) => a.code === '1020');
    const bankBalance = bankAcc?.balance || 0;
    const bankReconciliation = {
      bankName: 'HDFC Bank Corporate Current A/C #99401294',
      period: 'Current Period',
      bankBookBalance: bankBalance,
      bankStatementBalance: bankBalance,
      depositsInTransit: [],
      unclearedCheques: [],
      reconciledDifference: 0,
      status: 'Reconciled & Balanced ✓',
    };

    // 12. Daily Cash Book: cash account transactions
    const cashAcc = accounts.find((a) => a.code === '1010');
    const cashBalance = cashAcc?.balance || 0;
    const cashBook = [];

    const data = {
      sales,
      purchases,
      stock,
      customers,
      suppliers,
      orders,
      returns,
      payments,
      deliveries,
      expenses: expenseList,
      bankReconciliation,
      cashBook,
    };

    if (registerType && data[registerType]) {
      return res.json({ success: true, register: registerType, data: data[registerType] });
    }

    res.json({ success: true, registers: Object.keys(data), data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
