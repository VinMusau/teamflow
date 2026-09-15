import { Router } from 'express';
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { loadWorkspace, requireRole } from '../middleware/workspaceMiddleware.js';

// mergeParams: true  →  gives us :workspaceId from the parent router
const router = Router({ mergeParams: true });

router.use(protect);
router.use(loadWorkspace);

router.route('/')
  .get(listProjects)
  .post(requireRole('owner', 'admin', 'member'), createProject);

router.route('/:projectId')
  .get(getProject)
  .patch(requireRole('owner', 'admin', 'member'), updateProject)
  .delete(requireRole('owner', 'admin'), deleteProject);

export default router;