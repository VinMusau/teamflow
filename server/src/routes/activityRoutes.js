import { Router } from 'express';
import { listActivities } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';
import { loadWorkspace } from '../middleware/workspaceMiddleware.js';

const router = Router({ mergeParams: true });

router.use(protect);
router.use(loadWorkspace);

router.get('/', listActivities);

export default router;