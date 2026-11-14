import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment,
  deleteInvoice,
} from '../controllers/invoice.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInvoices)
  .post(createInvoice);

router.route('/:id')
  .get(getInvoiceById)
  .delete(deleteInvoice);

router.put('/:id/payment', recordPayment);

export default router;
