import { Router } from 'express';
import {
  scanQRCode,
  validateQRCode,
} from '../controllers/ticketController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Scan QR code for check-in (marks ticket as used)
router.post('/scan', authenticate, scanQRCode);

// Validate QR code without checking in (for preview)
router.post('/validate', authenticate, validateQRCode);

export default router;
