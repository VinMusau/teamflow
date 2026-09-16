import mongoose from 'mongoose';

export const ACTIONS = [
  'workspace.created',
  'workspace.updated',
  'workspace.member_added',
  'workspace.member_removed',
  'project.created',
  'project.updated',
  'project.deleted',
  'task.created',
  'task.updated',
  'task.status_changed',
  'task.assigned',
  'task.deleted',
  'comment.created',
  'comment.deleted',
];

const activitySchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ACTIONS,
      required: true,
    },
    // Denormalized snapshot of the target's display name.
    // Survives deletion of the target.
    targetLabel: {
      type: String,
      default: '',
    },
    // Optional references for linking / filtering
    targetType: {
      type: String,
      enum: ['workspace', 'project', 'task', 'comment', 'user', null],
      default: null,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    // Free-form payload for extra context: { from, to, changedFields, ... }
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Feed query: newest first, per workspace
activitySchema.index({ workspace: 1, createdAt: -1 });

// Auto-expire old activity after 180 days (optional — tune later)
// activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;