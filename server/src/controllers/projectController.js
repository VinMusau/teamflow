import Project from '../models/Project.js';

const populate = (q) =>
  q.populate('createdBy', 'name email avatar');

// GET /api/workspaces/:workspaceId/projects
export const listProjects = async (req, res, next) => {
  try {
    const projects = await populate(
      Project.find({ workspace: req.workspace._id }).sort({ createdAt: -1 })
    );
    res.json({ projects });
  } catch (err) {
    next(err);
  }
};

// POST /api/workspaces/:workspaceId/projects
export const createProject = async (req, res, next) => {
  try {
    const { name, description = '', color } = req.body;
    if (!name) {
      res.status(400);
      throw new Error('Project name is required');
    }

    const project = await Project.create({
      name,
      description,
      ...(color && { color }),
      workspace: req.workspace._id,
      createdBy: req.user._id,
    });

    const full = await populate(Project.findById(project._id));
    res.status(201).json({ project: full });
  } catch (err) {
    next(err);
  }
};

// GET /api/workspaces/:workspaceId/projects/:projectId
export const getProject = async (req, res, next) => {
  try {
    const project = await populate(
      Project.findOne({
        _id: req.params.projectId,
        workspace: req.workspace._id,
      })
    );
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }
    res.json({ project });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/workspaces/:workspaceId/projects/:projectId
export const updateProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const project = await Project.findOne({
      _id: req.params.projectId,
      workspace: req.workspace._id,
    });
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (color !== undefined) project.color = color;
    await project.save();

    const full = await populate(Project.findById(project._id));
    res.json({ project: full });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/workspaces/:workspaceId/projects/:projectId
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.projectId,
      workspace: req.workspace._id,
    });
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }
    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};