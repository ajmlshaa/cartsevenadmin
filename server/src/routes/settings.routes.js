import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.route('/')
  .get(getSettings)
  .put(authorize('admin'), updateSettings);

export default router;
