import { Router } from 'express';
import {
  listComments,
  createComment,
  deleteComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { loadWorkspace } from '../middleware/workspaceMiddleware.js';
import { loadProject } from '../middleware/projectMiddleware.js';
import { loadTask } from '../middleware/taskMiddleware.js';

const router = Router({ mergeParams: true });

router.use(protect);
router.use(loadWorkspace);
router.use(loadProject);
router.use(loadTask);

router.route('/')
  .get(listComments)
  .post(createComment);

router.route('/:commentId')
  .delete(deleteComment);

export default router;