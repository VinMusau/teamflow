import { emitToWorkspace } from '../config/socket.js';

export const emitTaskChange = (workspaceId, task) => {
  emitToWorkspace(workspaceId, 'task:changed', {
    _id: task._id.toString(),
    project: task.project.toString(),
    status: task.status,
    order: task.order,
    title: task.title,
    priority: task.priority,
    updatedAt: task.updatedAt,
  });
};