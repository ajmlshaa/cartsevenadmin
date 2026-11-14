import express from 'express';
import {
  getTrialBalance,
  getTradingAccount,
  getProfitAndLoss,
  getBalanceSheet,
  getCashFlowStatement,
  getStockSummary,
  getCustomerOutstanding,
  getSupplierOutstanding,
  getSalesPurchaseSummary,
  getProductProfitability,
  getTaxSummary,
} from '../controllers/reports.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/trial-balance', getTrialBalance);
router.get('/trading-account', getTradingAccount);
router.get('/profit-and-loss', getProfitAndLoss);
router.get('/balance-sheet', getBalanceSheet);
router.get('/cash-flow', getCashFlowStatement);
router.get('/stock-summary', getStockSummary);
router.get('/customer-outstanding', getCustomerOutstanding);
router.get('/supplier-outstanding', getSupplierOutstanding);
router.get('/sales-purchase-summary', getSalesPurchaseSummary);
router.get('/product-profitability', getProductProfitability);
router.get('/tax', getTaxSummary);

export default router;
