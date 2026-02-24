import { Router } from 'express';
import {
  getCommunities,
  getCommunity,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  requestAdmin,
  getAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
  setMemberRole,
  getMyAdminRequest,
} from '../controllers/communityController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getCommunities);
router.get('/:id', optionalAuth, getCommunity);
router.post('/', authenticate, createCommunity);
router.post('/:id/join', authenticate, joinCommunity);
router.delete('/:id/leave', authenticate, leaveCommunity);

// Admin request: member requests to be admin
router.post('/:id/admin-request', authenticate, requestAdmin);
router.get('/:id/admin-request/me', authenticate, getMyAdminRequest);
router.get('/:id/admin-requests', authenticate, getAdminRequests);
router.post('/:id/admin-requests/:requestId/approve', authenticate, approveAdminRequest);
router.post('/:id/admin-requests/:requestId/reject', authenticate, rejectAdminRequest);

// Owner assigns member role (moderator or member)
router.patch('/:id/members/:userId/role', authenticate, setMemberRole);

export default router;
