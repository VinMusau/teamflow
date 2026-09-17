import mongoose from 'mongoose';

export const NOTIFICATION_TYPES = [
  'workspace.member_added',
  'task.assigned',
  'comment.created',
];

const notificationSchema = new mongoose.Schema(
  {
    // Recipient
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Who triggered the notification
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Context — always set, so we can filter notifications by workspace later
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    // "Acme Inc" or "Design homepage" — the display name of what the
    // notification is about. Kept so the frontend can render a sentence.
    targetLabel: {
      type: String,
      required: true,
    },
    // Frontend route to navigate to when clicked
    link: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Unread count + feed query
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;