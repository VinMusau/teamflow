import api from './axios';

export const fetchNotifications = async ({ limit = 20, unreadOnly } = {}) => {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit);
  if (unreadOnly) params.set('unreadOnly', 'true');
  const res = await api.get(`/notifications?${params.toString()}`);
  return res.data.notifications;
};

export const fetchUnreadCount = async () => {
  const res = await api.get('/notifications/unread-count');
  return res.data.count;
};

export const markNotificationRead = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data.notification;
};

export const markAllNotificationsRead = async () => {
  const res = await api.patch('/notifications/read-all');
  return res.data;
};