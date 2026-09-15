import Task, { TASK_STATUSES, TASK_PRIORITIES } from '../models/Task.js';
import { isWorkspaceMember } from '../middleware/projectMiddleware.js';

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
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};