import { Router } from 'express';
import { getPlatformSettings, updatePlatformSettings } from '../controllers/platformSettingsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', getPlatformSettings);
router.patch('/', authenticate, updatePlatformSettings);

export default router;
