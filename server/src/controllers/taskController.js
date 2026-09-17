import Task, { TASK_STATUSES, TASK_PRIORITIES } from '../models/Task.js';
import { isWorkspaceMember } from '../middleware/projectMiddleware.js';
import { logActivity } from '../utils/logActivity.js';
import { notifyUsers } from '../utils/notifyUsers.js';

const populate = (q) => q.populate('assignee', 'name email avatar');

// GET /api/workspaces/:wid/projects/:pid/tasks
export const listTasks = async (req, res, next) => {
  try {
    const filter = { project: req.project._id };
    if (req.query.status && TASK_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.assignee) {
      filter.assignee = req.query.assignee;
    }

    const tasks = await populate(
      Task.find(filter).sort({ status: 1, order: 1, createdAt: -1 })
    );
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

// POST /api/workspaces/:wid/projects/:pid/tasks
export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description = '',
      status = 'todo',
      priority = 'medium',
      dueDate = null,
      assignee = null,
    } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Task title is required');
    }
    if (!TASK_STATUSES.includes(status)) {
      res.status(400);
      throw new Error(`Invalid status: ${status}`);
    }
    if (!TASK_PRIORITIES.includes(priority)) {
      res.status(400);
      throw new Error(`Invalid priority: ${priority}`);
    }

    // Assignee must be a workspace member
    if (assignee && !isWorkspaceMember(req.workspace, assignee)) {
      res.status(400);
      throw new Error('Assignee must be a member of the workspace');
    }

    // Next order value at the end of the target column
    const last = await Task.findOne({
      project: req.project._id,
      status,
    })
      .sort({ order: -1 })
      .select('order');
    const order = last ? last.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      assignee: assignee || null,
      project: req.project._id,
      workspace: req.workspace._id,
      createdBy: req.user._id,
      order,
    });

    const full = await populate(Task.findById(task._id));

    await logActivity({
      workspace: req.workspace._id,
      actor: req.user._id,
      action: 'task.created',
      targetType: 'task',
      targetId: full._id,
      targetLabel: full.title,
      meta: { status: full.status, priority: full.priority },
    });

    if (task.assignee) {
      await notifyUsers({
        recipients: [task.assignee],
        actor: req.user._id,
        workspace: req.workspace._id,
        type: 'task.assigned',
        targetLabel: task.title,
        link: `/workspaces/${req.workspace._id}/projects/${req.project._id}`,
      });
    }

    res.status(201).json({ task: full });
  } catch (err) {
    next(err);
  }
};

// GET /api/workspaces/:wid/projects/:pid/tasks/:taskId
export const getTask = async (req, res, next) => {
  try {
    const task = await populate(
      Task.findOne({ _id: req.params.taskId, project: req.project._id })
    );
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/workspaces/:wid/projects/:pid/tasks/:taskId
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      project: req.project._id,
    });
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignee,
      order,
    } = req.body;

    if (status !== undefined && !TASK_STATUSES.includes(status)) {
      res.status(400);
      throw new Error(`Invalid status: ${status}`);
    }
    if (priority !== undefined && !TASK_PRIORITIES.includes(priority)) {
      res.status(400);
      throw new Error(`Invalid priority: ${priority}`);
    }
    if (
      assignee !== undefined &&
      assignee !== null &&
      !isWorkspaceMember(req.workspace, assignee)
    ) {
      res.status(400);
      throw new Error('Assignee must be a member of the workspace');
    }

    // Snapshot original values for the activity log
    const original = {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignee: task.assignee?.toString() ?? null,
    };

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) {
      task.dueDate = dueDate ? new Date(dueDate) : null;
    }
    if (assignee !== undefined) task.assignee = assignee || null;
    if (order !== undefined) task.order = order;

    await task.save();

    const full = await populate(Task.findById(task._id));

    // Compute what actually changed and log the meaningful events
    const changedFields = [];
    if (title !== undefined && title !== original.title) changedFields.push('title');
    if (description !== undefined && description !== original.description) changedFields.push('description');
    if (priority !== undefined && priority !== original.priority) changedFields.push('priority');
    if (dueDate !== undefined) changedFields.push('dueDate');
    if (order !== undefined) changedFields.push('order');

    const newAssignee = task.assignee?.toString() ?? null;
    if (assignee !== undefined && newAssignee !== original.assignee) {
      await logActivity({
        workspace: req.workspace._id,
        actor: req.user._id,
        action: 'task.assigned',
        targetType: 'task',
        targetId: task._id,
        targetLabel: task.title,
        meta: { from: original.assignee, to: newAssignee },
      });
    }

    if (assignee !== undefined && newAssignee !== original.assignee && newAssignee) {
      await notifyUsers({
        recipients: [newAssignee],
        actor: req.user._id,
        workspace: req.workspace._id,
        type: 'task.assigned',
        targetLabel: task.title,
        link: `/workspaces/${req.workspace._id}/projects/${req.project._id}`,
      });
    }

    if (status !== undefined && status !== original.status) {
      await logActivity({
        workspace: req.workspace._id,
        actor: req.user._id,
        action: 'task.status_changed',
        targetType: 'task',
        targetId: task._id,
        targetLabel: task.title,
        meta: { from: original.status, to: status },
      });
    }

    if (changedFields.length) {
      await logActivity({
        workspace: req.workspace._id,
        actor: req.user._id,
        action: 'task.updated',
        targetType: 'task',
        targetId: task._id,
        targetLabel: task.title,
        meta: { changedFields },
      });
    }

    res.json({ task: full });
  } catch (err) {
    next(err);
  }
};
// DELETE /api/workspaces/:wid/projects/:pid/tasks/:taskId
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      project: req.project._id,
    });

    await logActivity({
      workspace: req.workspace._id,
      actor: req.user._id,
      action: 'task.deleted',
      targetType: 'task',
      targetId: task._id,
      targetLabel: task.title,
    });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};