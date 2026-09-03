import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from '../controllers/blogController.js';
const router=Router();
router.get('/',getBlogs); router.get('/:id',getBlogById); router.post('/',authenticate,requireRole('admin','superadmin'),createBlog); router.put('/:id',authenticate,requireRole('admin','superadmin'),updateBlog); router.delete('/:id',authenticate,requireRole('admin','superadmin'),deleteBlog);
export default router;
