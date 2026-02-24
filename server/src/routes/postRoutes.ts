import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadPost } from '../utils/upload.js';
import { createPost, getPosts, likePost, commentPost, getPostComments } from '../controllers/postController.js';

const router = Router();

router.post('/', authenticate, uploadPost.single('image'), createPost);
router.get('/', authenticate, getPosts);
router.post('/:id/like', authenticate, likePost);
router.post('/:id/comment', authenticate, commentPost);
router.get('/:id/comments', authenticate, getPostComments);

export default router;
