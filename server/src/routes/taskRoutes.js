import { Router } from 'express';
import {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { loadWorkspace } from '../middleware/workspaceMiddleware.js';
import { loadProject } from '../middleware/projectMiddleware.js';

const router = Router({ mergeParams: true });

router.use(protect);
router.use(loadWorkspace);
router.use(loadProject);

router.route('/')
  .get(listTasks)
  .post(createTask);

router.route('/:taskId')
  .get(getTask)
  .patch(updateTask)
  .delete(deleteTask);

export default router;