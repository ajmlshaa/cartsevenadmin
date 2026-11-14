import express from 'express';
import { getRegistersData } from '../controllers/register.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getRegistersData);
router.get('/:registerType', protect, getRegistersData);

export default router;
