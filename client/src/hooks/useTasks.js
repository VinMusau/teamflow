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
    },
  });
}

export function useUpdateTask(workspaceId, projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateTask,
    onSuccess: (task) => {
      qc.invalidateQueries({
        queryKey: taskKeys.list(workspaceId, projectId),
      });
      qc.setQueryData(
        taskKeys.detail(workspaceId, projectId, task._id),
        task
      );
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
    },
  });
}