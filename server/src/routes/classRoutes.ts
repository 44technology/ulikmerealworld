import { Router } from 'express';
import {
  createClass,
  getClasses,
  getNearbyClasses,
  getClass,
  enrollInClass,
  cancelEnrollment,
  getMyClasses,
} from '../controllers/classController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { validateQuery } from '../middleware/validateQuery.js';
import {
  createClassSchema,
  nearbyClassesSchema,
} from '../validations/classValidation.js';
import { upload } from '../utils/upload.js';

const router = Router();

/** When client sends FormData with data=JSON.stringify(...), merge parsed data into req.body for validation */
const parseClassBody = (req: any, _res: any, next: any) => {
  if (typeof req.body?.data === 'string') {
    try {
      req.body = { ...req.body, ...JSON.parse(req.body.data) };
    } catch {
      // leave body as-is; validation will fail with clear errors
    }
  }
  next();
};

router.get('/nearby', optionalAuth, validateQuery(nearbyClassesSchema), getNearbyClasses);
router.get('/my-classes', authenticate, getMyClasses);
router.get('/', optionalAuth, getClasses);
router.get('/:id', optionalAuth, getClass);
router.post('/', authenticate, upload.single('image'), parseClassBody, validateRequest(createClassSchema), createClass);
router.post('/:id/enroll', authenticate, enrollInClass);
router.delete('/:id/enroll', authenticate, cancelEnrollment);

export default router;
