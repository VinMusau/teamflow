import Workspace from '../models/Workspace.js';
import User from '../models/User.js';

const populate = (q) =>
  q
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

// GET /api/workspaces  → my workspaces
export const listMyWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await populate(
      Workspace.find({ 'members.user': req.user._id }).sort({ updatedAt: -1 })
    );
    res.json({ workspaces });
  } catch (err) {
    next(err);
  }
};

// POST /api/workspaces
export const createWorkspace = async (req, res, next) => {
  try {
    const { name, description = '' } = req.body;

    if (!name) {
      res.status(400);
      throw new Error('Workspace name is required');
    }

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
    });

    const full = await populate(Workspace.findById(workspace._id));
    res.status(201).json({ workspace: full });
  } catch (err) {
    next(err);
  }
};

// GET /api/workspaces/:workspaceId  (loadWorkspace already ran)
export const getWorkspace = async (req, res) => {
  const workspace = await populate(Workspace.findById(req.workspace._id));
  res.json({ workspace });
};

// PATCH /api/workspaces/:workspaceId  (owner/admin)
export const updateWorkspace = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (name !== undefined) req.workspace.name = name;
    if (description !== undefined) req.workspace.description = description;
    await req.workspace.save();

    const full = await populate(Workspace.findById(req.workspace._id));
    res.json({ workspace: full });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/workspaces/:workspaceId  (owner only)
export const deleteWorkspace = async (req, res, next) => {
  try {
    await req.workspace.deleteOne();
    res.json({ message: 'Workspace deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/workspaces/:workspaceId/members   body: { email, role }
export const addMember = async (req, res, next) => {
  try {
    const { email, role = 'member' } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404);
      throw new Error('No user with that email');
    }

    const already = req.workspace.members.some(
      (m) => m.user.toString() === user._id.toString()
    );
    if (already) {
      res.status(409);
      throw new Error('User is already a member');
    }

    req.workspace.members.push({ user: user._id, role });
    await req.workspace.save();

    const full = await populate(Workspace.findById(req.workspace._id));
    res.status(201).json({ workspace: full });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/workspaces/:workspaceId/members/:userId  (owner/admin)
export const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId === req.workspace.owner.toString()) {
      res.status(400);
      throw new Error('Cannot remove the owner');
    }

    req.workspace.members = req.workspace.members.filter(
      (m) => m.user.toString() !== userId
    );
    await req.workspace.save();

    const full = await populate(Workspace.findById(req.workspace._id));
    res.json({ workspace: full });
  } catch (err) {
    next(err);
  }
};