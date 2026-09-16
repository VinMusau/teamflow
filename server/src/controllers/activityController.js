import Activity from '../models/Activity.js';

// GET /api/workspaces/:workspaceId/activities?limit=30&before=<ISO>
export const listActivities = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const filter = { workspace: req.workspace._id };

    // Cursor-based pagination: fetch entries older than `before`
    if (req.query.before) {
      const before = new Date(req.query.before);
      if (!isNaN(before.getTime())) {
        filter.createdAt = { $lt: before };
      }
    }

    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('actor', 'name email avatar');

    // hasMore signals the client to show a "Load more" button
    const hasMore = activities.length === limit;

    res.json({ activities, hasMore });
  } catch (err) {
    next(err);
  }
};