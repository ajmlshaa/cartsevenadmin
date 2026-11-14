import { localStore } from '../utils/localStore.js';

// Helper to get accounts
const getAccounts = () => localStore.data.accounts || [];
const getInvoices = () => localStore.data.invoices || [];
const getExpenses = () => localStore.data.expenses || [];
const getVouchers = () => localStore.data.vouchers || [];

// 1. Trial Balance
export const getTrialBalance = async (req, res) => {
  try {
    const accounts = getAccounts();

    const data = accounts.map((acc) => {
      let debit = 0;
      let credit = 0;
      const bal = Number(acc.balance) || 0;

      if (acc.type === 'Asset' || acc.type === 'Expense') {
        if (bal >= 0) debit = bal;
        else credit = Math.abs(bal);
      } else {
        // Liability, Equity, Revenue
        if (bal >= 0) credit = bal;
        else debit = Math.abs(bal);
      }

      return {
        code: acc.code,
        account: acc.name,
        debit,
        credit,
      };
    });

    const totalDebit = data.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = data.reduce((sum, item) => sum + item.credit, 0);

    res.json({
      success: true,
      data: {
        items: data,
        totalDebit,
        totalCredit,
        isBalanced: Math.abs(totalDebit - totalCredit) === 0,
        difference: totalDebit - totalCredit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Trading Account
export const getTradingAccount = async (req, res) => {
  try {
    const accounts = getAccounts();
    const findBal = (code) => Number(accounts.find((a) => a.code === code)?.balance) || 0;

    const purchases = findBal('4010');
    const purchaseReturns = findBal('4020');
    const freightInward = findBal('4030');
    const packaging = findBal('4040');
    const customsDuty = findBal('4050');

    const sales = findBal('3010');
    const shippingIncome = findBal('3020');
    const salesReturns = findBal('3040');
    const salesDiscounts = findBal('3050');
    const closingStock = findBal('1070');

    const totalDirectCosts = purchases - purchaseReturns + freightInward + packaging + customsDuty;
    const totalDirectIncome = sales + shippingIncome - salesReturns - salesDiscounts;
    const grossProfit = Math.max(0, totalDirectIncome - totalDirectCosts);
    const grossProfitRatio = totalDirectIncome > 0 ? ((grossProfit / totalDirectIncome) * 100).toFixed(2) + '%' : '0.00%';

    const data = {
      debitSide: [
        { name: 'Opening Stock of Goods', amount: 0 },
        { name: 'Add: Purchases Account', amount: purchases },
        { name: 'Less: Purchase Returns', amount: -purchaseReturns },
        { name: 'Direct Expense: Freight Inward', amount: freightInward },
        { name: 'Direct Expense: Packaging Materials', amount: packaging },
        { name: 'Direct Expense: Customs Duty on Imports', amount: customsDuty },
        { name: 'Gross Profit c/d (Transferred to P&L)', amount: grossProfit, isHighlight: true },
      ],
      creditSide: [
        { name: 'Product Sales Account', amount: sales },
        { name: 'Add: Shipping Income Collected', amount: shippingIncome },
        { name: 'Less: Sales Returns', amount: -salesReturns },
        { name: 'Less: Sales Discounts Allowed', amount: -salesDiscounts },
        { name: 'Closing Stock (Valued at Lower of Cost or Market)', amount: closingStock },
      ],
      totalTradingTurnover: totalDirectIncome,
      grossProfit,
      grossProfitRatio,
    };

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Profit and Loss Account
export const getProfitAndLoss = async (req, res) => {
  try {
    const accounts = getAccounts();
    const findBal = (code) => Number(accounts.find((a) => a.code === code)?.balance) || 0;

    const sales = findBal('3010');
    const shippingIncome = findBal('3020');
    const otherIncomeBal = findBal('3030');
    const purchases = findBal('4010');
    const grossProfit = Math.max(0, sales + shippingIncome - purchases);

    const operatingExpensesList = [
      { category: 'Advertising and Marketing', amount: findBal('5010') },
      { category: 'Facebook/Instagram Ads', amount: findBal('5020') },
      { category: 'Website Hosting (AWS/Cloud)', amount: findBal('5030') },
      { category: 'Domain Charges', amount: findBal('5040') },
      { category: 'Payment Gateway Charges', amount: findBal('5050') },
      { category: 'Shipping and Delivery Charges (Outward)', amount: findBal('5060') },
      { category: 'Office Expenses', amount: findBal('5070') },
      { category: 'Internet and Telephone', amount: findBal('5080') },
      { category: 'Software Subscriptions (Shopify/Klaviyo)', amount: findBal('5090') },
      { category: 'Bank Charges', amount: findBal('5100') },
      { category: 'Salary and Wages', amount: findBal('5110') },
    ];

    const totalOperatingExpenses = operatingExpensesList.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = grossProfit + otherIncomeBal - totalOperatingExpenses;
    const netProfitRatio = sales > 0 ? ((netProfit / sales) * 100).toFixed(1) + '%' : '0.0%';

    const data = {
      grossProfit,
      otherIncome: [
        { name: 'Other Operating Income', amount: otherIncomeBal },
      ],
      operatingExpenses: operatingExpensesList,
      totalOperatingExpenses,
      netProfit,
      netProfitRatio,
    };

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Balance Sheet
export const getBalanceSheet = async (req, res) => {
  try {
    const accounts = getAccounts();
    const findBal = (code) => Number(accounts.find((a) => a.code === code)?.balance) || 0;

    const currentAssetsList = [
      { name: 'Cash in Hand', amount: findBal('1010') },
      { name: 'Bank Account (HDFC Current)', amount: findBal('1020') },
      { name: 'COD Receivable', amount: findBal('1030') },
      { name: 'Payment Gateway Clearing', amount: findBal('1040') },
      { name: 'Marketplace Clearing', amount: findBal('1050') },
      { name: 'Accounts Receivable', amount: findBal('1060') },
      { name: 'Inventory / Stock on Hand', amount: findBal('1070') },
      { name: 'Inventory in Transit', amount: findBal('1080') },
      { name: 'Security Deposit', amount: findBal('1090') },
    ];

    const fixedAssetsList = [
      { name: 'Computer and Equipment', amount: findBal('1100') },
      { name: 'Website Development Cost', amount: findBal('1110') },
    ];

    const totalAssets = [...currentAssetsList, ...fixedAssetsList].reduce((sum, item) => sum + item.amount, 0);

    const currentLiabilitiesList = [
      { name: 'Accounts Payable', amount: findBal('2030') },
      { name: 'Supplier Payable', amount: findBal('2035') },
      { name: 'GST/VAT Payable (Net Output Tax)', amount: findBal('2050') },
      { name: 'Courier Payable', amount: findBal('2060') },
      { name: 'Customer Refund Payable', amount: findBal('2070') },
    ];

    const longTermLiabilitiesList = [
      { name: 'Bank Loan (Working Capital)', amount: findBal('2040') },
    ];

    const equityList = [
      { name: "AJMALSHA Capital Account", amount: findBal('2011') },
      { name: "ASHIQUE SALIM Capital Account", amount: findBal('2012') },
      { name: "SHANU Capital Account", amount: findBal('2013') },
      { name: "Less: AJMALSHA Drawings", amount: -findBal('2021') },
      { name: "Less: ASHIQUE SALIM Drawings", amount: -findBal('2022') },
      { name: "Less: SHANU Drawings", amount: -findBal('2023') },
    ];

    const totalLiabilitiesAndEquity = [
      ...currentLiabilitiesList,
      ...longTermLiabilitiesList,
      ...equityList,
    ].reduce((sum, item) => sum + item.amount, 0);

    const data = {
      assets: {
        currentAssets: currentAssetsList,
        fixedAssets: fixedAssetsList,
        totalAssets,
      },
      liabilities: {
        currentLiabilities: currentLiabilitiesList,
        longTermLiabilities: longTermLiabilitiesList,
        equity: equityList,
        totalLiabilitiesAndEquity,
      },
    };

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Cash Flow Statement
export const getCashFlowStatement = async (req, res) => {
  try {
    const invoices = getInvoices();
    const expenses = getExpenses();
    const accounts = getAccounts();
    const findBal = (code) => Number(accounts.find((a) => a.code === code)?.balance) || 0;

    const receipts = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const payments = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const netOperating = receipts - payments;

    const cashOnHand = findBal('1010') + findBal('1020');

    const data = {
      operatingActivities: [
        { name: 'Cash Receipts from Invoices & Collections', amount: receipts },
        { name: 'Cash Paid for Expenses & Outflows', amount: -payments },
        { name: 'Net Cash from Operating Activities', amount: netOperating, isTotal: true },
      ],
      investingActivities: [
        { name: 'Purchase of Computers & Equipment', amount: -findBal('1100') },
        { name: 'Website Development Investments', amount: -findBal('1110') },
        { name: 'Net Cash from Investing Activities', amount: -(findBal('1100') + findBal('1110')), isTotal: true },
      ],
      financingActivities: [
        { name: "Partners' Capital Introduced", amount: findBal('2011') + findBal('2012') + findBal('2013') },
        { name: "Less: Partners' Drawings", amount: -(findBal('2021') + findBal('2022') + findBal('2023')) },
        { name: 'Net Cash from Financing Activities', amount: (findBal('2011') + findBal('2012') + findBal('2013')) - (findBal('2021') + findBal('2022') + findBal('2023')), isTotal: true },
      ],
      netIncreaseInCash: netOperating,
      openingCashAndBank: 0,
      closingCashAndBank: cashOnHand,
    };

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Stock Summary
export const getStockSummary = async (req, res) => {
  try {
    const items = [];
    const totalStockValue = 0;
    res.json({ success: true, data: { items, totalStockValue, totalSKUs: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Customer Outstanding Report
export const getCustomerOutstanding = async (req, res) => {
  try {
    const invoices = getInvoices();
    const customerMap = {};

    invoices.forEach((inv) => {
      const name = inv.customerName || 'Customer';
      if (!customerMap[name]) {
        customerMap[name] = {
          name,
          email: inv.customerEmail || '-',
          totalInvoiced: 0,
          paid: 0,
          currentDue: 0,
          days30: 0,
          days60: 0,
          totalOutstanding: 0,
          terms: 'Net 15',
        };
      }
      customerMap[name].totalInvoiced += inv.totalAmount || 0;
      customerMap[name].paid += inv.amountPaid || 0;
      const due = inv.balanceDue !== undefined ? inv.balanceDue : (inv.totalAmount - (inv.amountPaid || 0));
      customerMap[name].totalOutstanding += due;
      customerMap[name].currentDue += due;
    });

    const customers = Object.values(customerMap);
    const totalReceivable = customers.reduce((sum, c) => sum + c.totalOutstanding, 0);

    res.json({ success: true, data: { customers, totalReceivable } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Supplier Outstanding Report
export const getSupplierOutstanding = async (req, res) => {
  try {
    const suppliers = [];
    const totalPayable = 0;
    res.json({ success: true, data: { suppliers, totalPayable } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Sales and Purchase Summary
export const getSalesPurchaseSummary = async (req, res) => {
  try {
    const invoices = getInvoices();
    const expenses = getExpenses();

    const months = [];
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      const mInvoices = invoices.filter((inv) => {
        const invDate = new Date(inv.issueDate || inv.createdAt);
        return invDate >= d && invDate < nextMonth;
      });
      const sales = mInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

      const mExpenses = expenses.filter((exp) => {
        const expDate = new Date(exp.date || exp.createdAt);
        return expDate >= d && expDate < nextMonth;
      });
      const purchases = mExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

      months.push({
        month: `${monthLabel} ${year}`,
        sales,
        purchases,
        cogs: Math.round(purchases * 0.8),
        grossMargin: Math.max(0, sales - purchases),
      });
    }

    const totalSales = months.reduce((s, m) => s + m.sales, 0);
    const totalPurchases = months.reduce((s, m) => s + m.purchases, 0);

    res.json({ success: true, data: { monthlyData: months, totalSales, totalPurchases } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10. Product-wise Profitability Report
export const getProductProfitability = async (req, res) => {
  try {
    const invoices = getInvoices();
    const productMap = {};

    invoices.forEach((inv) => {
      inv.items?.forEach((it) => {
        const name = it.description || 'Item';
        if (!productMap[name]) {
          productMap[name] = {
            sku: it.sku || 'SKU-01',
            name,
            unitsSold: 0,
            sellingPrice: it.unitPrice || 0,
            unitCost: Math.round((it.unitPrice || 0) * 0.6),
            packagingShipping: 0,
            gatewayFee: 0,
            grossRevenue: 0,
            totalCOGS: 0,
            directExp: 0,
            netProfit: 0,
            profitMargin: '0.0%',
          };
        }
        const qty = Number(it.quantity) || 1;
        productMap[name].unitsSold += qty;
        productMap[name].grossRevenue += it.amount || (qty * (it.unitPrice || 0));
        productMap[name].totalCOGS += qty * productMap[name].unitCost;
        productMap[name].netProfit = productMap[name].grossRevenue - productMap[name].totalCOGS;
        productMap[name].profitMargin = productMap[name].grossRevenue > 0
          ? ((productMap[name].netProfit / productMap[name].grossRevenue) * 100).toFixed(1) + '%'
          : '0.0%';
      });
    });

    const products = Object.values(productMap);
    const totalProductRevenue = products.reduce((s, p) => s + p.grossRevenue, 0);
    const totalProductProfit = products.reduce((s, p) => s + p.netProfit, 0);

    res.json({
      success: true,
      data: {
        products,
        totalProductRevenue,
        totalProductProfit,
        averageMargin: totalProductRevenue > 0 ? ((totalProductProfit / totalProductRevenue) * 100).toFixed(1) + '%' : '0.0%',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tax Report Endpoint
export const getTaxSummary = async (req, res) => {
  try {
    const invoices = getInvoices();
    const expenses = getExpenses();

    const taxCollected = invoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);
    const taxPaidOnExpenses = expenses.reduce((sum, exp) => sum + (exp.taxAmount || 0), 0);
    const netTaxOwed = Math.max(0, taxCollected - taxPaidOnExpenses);

    res.json({
      success: true,
      data: {
        taxCollected,
        taxPaidOnExpenses,
        netTaxOwed,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
