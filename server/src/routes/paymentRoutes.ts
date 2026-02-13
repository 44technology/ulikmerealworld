import { Router } from 'express';
import {
  createPayment,
  getPayment,
  getUserPayments,
  getPlatformRevenue,
  getPaymentBreakdownHandler,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/breakdown', getPaymentBreakdownHandler);
router.get('/revenue', getPlatformRevenue);
router.get('/', authenticate, getUserPayments);
router.get('/:id', authenticate, getPayment);
router.post('/', authenticate, createPayment);

export default router;
