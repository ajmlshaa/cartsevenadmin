import express from 'express';
import { login, getMe, updateProfile, changePassword, getAccessInfo } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/access-info', getAccessInfo);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
