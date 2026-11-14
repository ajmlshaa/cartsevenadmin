import express from 'express';
import { getVouchers, createVoucher, deleteVoucher } from '../controllers/voucher.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getVouchers);
router.post('/', protect, createVoucher);
router.delete('/:id', protect, deleteVoucher);

export default router;
