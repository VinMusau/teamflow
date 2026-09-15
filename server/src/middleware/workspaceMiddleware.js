import Workspace from '../models/Workspace.js';

// Loads workspace by :workspaceId and attaches it to req.workspace
// Only succeeds if req.user is a member.
export const loadWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId);

    if (!workspace) {
      res.status(404);
      throw new Error('Workspace not found');
    }

    const membership = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!membership) {
      res.status(403);
      throw new Error('You are not a member of this workspace');
    }

    req.workspace = workspace;
    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
};

// Require one of the given roles. Must be used after loadWorkspace.
export const requireRole = (...allowed) => (req, res, next) => {
  if (!allowed.includes(req.membership.role)) {
    res.status(403);
    return next(
      new Error(`Requires one of: ${allowed.join(', ')}`)
    );
  }
  next();
};