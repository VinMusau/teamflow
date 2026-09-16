import Task from '../models/Task.js';

// Runs after loadWorkspace and loadProject.
export const loadTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      project: req.project._id,
    });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    req.task = task;
    next();
  } catch (err) {
    next(err);
  }
};