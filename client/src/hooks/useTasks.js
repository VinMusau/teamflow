import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../api/tasks';
import { activityKeys } from './useActivities';

export const taskKeys = {
  list: (workspaceId, projectId) => ['tasks', workspaceId, projectId],
  detail: (workspaceId, projectId, taskId) => [
    'tasks',
    workspaceId,
    projectId,
    taskId,
  ],
};

export function useTasks(workspaceId, projectId) {
  return useQuery({
    queryKey: taskKeys.list(workspaceId, projectId),
    queryFn: () => fetchTasks(workspaceId, projectId),
    enabled: !!workspaceId && !!projectId,
  });
}

export function useCreateTask(workspaceId, projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: taskKeys.list(workspaceId, projectId),
      });
      qc.invalidateQueries({ queryKey: activityKeys.list(workspace._id) });
    },
  });
}

export function useUpdateTask(workspaceId, projectId) {
  const qc = useQueryClient();
  const listKey = taskKeys.list(workspaceId, projectId);

  return useMutation({
    mutationFn: updateTask,

    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: listKey });
      const prev = qc.getQueryData(listKey);

      qc.setQueryData(listKey, (old) => {
        if (!old) return old;
        return old.map((t) => {
          if (t._id !== vars.taskId) return t;
          return {
            ...t,
            ...(vars.status !== undefined && { status: vars.status }),
            ...(vars.order !== undefined && { order: vars.order }),
            ...(vars.priority !== undefined && { priority: vars.priority }),
            ...(vars.title !== undefined && { title: vars.title }),
          };
        });
      });

      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(listKey, ctx.prev);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: listKey });
    },
  });
}

export function useDeleteTask(workspaceId, projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: taskKeys.list(workspaceId, projectId),
      });
      qc.invalidateQueries({ queryKey: activityKeys.list(workspaceId) });
    },
  });
}