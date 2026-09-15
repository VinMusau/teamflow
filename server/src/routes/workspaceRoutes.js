import { Router } from 'express';
import {
  listMyWorkspaces,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
} from '../controllers/workspaceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { loadWorkspace, requireRole } from '../middleware/workspaceMiddleware.js';
import projectRoutes from './projectRoutes.js';

const router = Router();

// All workspace routes require auth
router.use(protect);

router.route('/')
  .get(listMyWorkspaces)
  .post(createWorkspace);

router.use('/:workspaceId/projects', projectRoutes);

router.route('/:workspaceId')
  .get(loadWorkspace, getWorkspace)
  .patch(loadWorkspace, requireRole('owner', 'admin'), updateWorkspace)
  .delete(loadWorkspace, requireRole('owner'), deleteWorkspace);

router.post(
  '/:workspaceId/members',
  loadWorkspace,
  requireRole('owner', 'admin'),
  addMember
);

router.delete(
  '/:workspaceId/members/:userId',
  loadWorkspace,
  requireRole('owner', 'admin'),
  removeMember
);

export default router;