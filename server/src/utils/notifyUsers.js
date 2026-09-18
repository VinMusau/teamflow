import Notification from '../models/Notification.js';
import { emitToUser } from '../config/socket.js';

export const notifyUsers = async ({
  recipients,
  actor,
  workspace,
  type,
  targetLabel,
  link,
}) => {
  try {
    const actorId = actor.toString();
    const unique = [...new Set(recipients.map((r) => r.toString()))].filter(
      (r) => r !== actorId
    );

    if (unique.length === 0) return;

    const docs = await Notification.insertMany(
      unique.map((userId) => ({
        user: userId,
        actor,
        workspace,
        type,
        targetLabel,
        link,
      }))
    );

    // Emit a personalized payload per recipient so the frontend
    // can render immediately without a round trip.
    for (const doc of docs) {
      emitToUser(doc.user, 'notification:new', {
        _id: doc._id.toString(),
        type: doc.type,
        targetLabel: doc.targetLabel,
        link: doc.link,
        read: doc.read,
        createdAt: doc.createdAt,
        // The actor field is just an ID on the doc; the frontend
        // will receive name via the invalidated refetch, or we can
        // populate here. We'll let the refetch handle names.
      });
    }
  } catch (err) {
    console.error('notifyUsers failed:', err.message);
  }
};