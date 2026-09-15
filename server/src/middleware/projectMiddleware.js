import Project from '../models/Project.js';

export const loadProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      workspace: req.workspace._id,
    });

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};

export const isWorkspaceMember = (workspace, userId) => {
  return workspace.members.some(
    (m) => m.user.toString() === userId.toString()
  );
};