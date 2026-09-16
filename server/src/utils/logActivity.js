import Activity from '../models/Activity.js';

/**
 * Write an activity entry. Never throws — activity logging must not
 * break the primary request.
 *
 * @param {Object} payload
 * @param {ObjectId} payload.workspace
 * @param {ObjectId} payload.actor
 * @param {string}   payload.action       one of ACTIONS
 * @param {string}   [payload.targetLabel]
 * @param {string}   [payload.targetType]
 * @param {ObjectId} [payload.targetId]
 * @param {Object}   [payload.meta]
 */
export const logActivity = async (payload) => {
  try {
    await Activity.create(payload);
  } catch (err) {
    console.error('logActivity failed:', err.message);
  }
};