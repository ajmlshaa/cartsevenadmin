import express from 'express';
import {
  getAccounts,
  createAccount,
  getTransactions,
} from '../controllers/account.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAccounts)
  .post(createAccount);

router.get('/transactions', getTransactions);

export default router;
