import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../lib/socket';
import { notificationKeys } from './useNotifications';
import { activityKeys } from './useActivities';

// Subscribes to socket events and invalidates the matching queries.
// Call this once, from a component that lives for the whole session.
export function useRealtime({ workspaceId } = {}) {
  const qc = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNotification = () => {
      qc.invalidateQueries({ queryKey: notificationKeys.list });
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    };

    const onActivity = () => {
      if (workspaceId) {
        qc.invalidateQueries({
          queryKey: activityKeys.list(workspaceId),
        });
      }
    };

    const onTaskChanged = (task) => {
      // Invalidate the task list for the affected project
      qc.invalidateQueries({
        queryKey: ['tasks', workspaceId, task.project],
      });
    };

    socket.on('notification:new', onNotification);
    socket.on('activity:new', onActivity);
    socket.on('task:changed', onTaskChanged);
    socket.on('task:deleted', onTaskChanged);

    return () => {
      socket.off('notification:new', onNotification);
      socket.off('activity:new', onActivity);
      socket.off('task:changed', onTaskChanged);
      socket.off('task:deleted', onTaskChanged);
    };
  }, [qc, workspaceId]);
}