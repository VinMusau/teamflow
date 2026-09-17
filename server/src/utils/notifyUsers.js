import Notification from '../models/Notification.js';

/**
 * Create one notification per recipient.
 * - Excludes the actor (you don't get notified about your own actions)
 * - Deduplicates recipients
 * - Never throws
 */
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

    await Notification.insertMany(
      unique.map((userId) => ({
        user: userId,
        actor,
        workspace,
        type,
        targetLabel,
        link,
      }))
    );
  } catch (err) {
    console.error('notifyUsers failed:', err.message);
  }
};