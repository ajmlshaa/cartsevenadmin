import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUsers)
  .post(authorize('admin'), createUser);

router.route('/:id')
  .put(authorize('admin'), updateUser);

export default router;
