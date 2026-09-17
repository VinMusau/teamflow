import Comment from '../models/Comment.js';
import { notifyUsers } from '../utils/notifyUsers.js';
import Task from '../models/Task.js';

const populate = (q) => q.populate('author', 'name email avatar');

// Fetch the task with its assignee and creator populated
const task = await Task.findById(req.task._id).select('assignee createdBy');

const recipients = [];
if (task.assignee) recipients.push(task.assignee);
if (task.createdBy) recipients.push(task.createdBy);

await notifyUsers({
  recipients,
  actor: req.user._id,
  workspace: req.workspace._id,
  type: 'comment.created',
  targetLabel: req.task.title,
  link: `/workspaces/${req.workspace._id}/projects/${req.project._id}`,
});

// GET /api/workspaces/:wid/projects/:pid/tasks/:taskId/comments
export const listComments = async (req, res, next) => {
  try {
    const comments = await populate(
      Comment.find({ task: req.task._id }).sort({ createdAt: 1 })
    );
    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

// POST /api/workspaces/:wid/projects/:pid/tasks/:taskId/comments
export const createComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      res.status(400);
      throw new Error('Comment text is required');
    }

    const comment = await Comment.create({
      text: text.trim(),
      task: req.task._id,
      author: req.user._id,
    });

    const full = await populate(Comment.findById(comment._id));
    res.status(201).json({ comment: full });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/workspaces/:wid/projects/:pid/tasks/:taskId/comments/:commentId
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.commentId,
      task: req.task._id,
    });

    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    const isAuthor =
      comment.author.toString() === req.user._id.toString();
    const isAdmin = ['owner', 'admin'].includes(req.membership.role);

    if (!isAuthor && !isAdmin) {
      res.status(403);
      throw new Error('You cannot delete this comment');
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};