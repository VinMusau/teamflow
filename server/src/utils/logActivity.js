import Activity from '../models/Activity.js';
import { emitToWorkspace } from '../config/socket.js';

export const logActivity = async (payload) => {
  try {
    const activity = await Activity.create(payload);

    emitToWorkspace(activity.workspace, 'activity:new', {
      _id: activity._id.toString(),
      action: activity.action,
      targetLabel: activity.targetLabel,
      targetType: activity.targetType,
      targetId: activity.targetId?.toString() ?? null,
      meta: activity.meta,
      createdAt: activity.createdAt,
      workspace: activity.workspace.toString(),
    });
  } catch (err) {
    console.error('logActivity failed:', err.message);
  }
};