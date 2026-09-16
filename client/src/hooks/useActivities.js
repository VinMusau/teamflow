import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchActivities } from '../api/activities';

export const activityKeys = {
  list: (workspaceId) => ['activities', workspaceId],
};

export function useActivities(workspaceId, { limit = 30 } = {}) {
  return useInfiniteQuery({
    queryKey: activityKeys.list(workspaceId),
    queryFn: ({ pageParam }) =>
      fetchActivities({
        workspaceId,
        limit,
        before: pageParam,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || lastPage.activities.length === 0) return null;
      return lastPage.activities[lastPage.activities.length - 1].createdAt;
    },
    enabled: !!workspaceId,
  });
}