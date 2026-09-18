import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  fetchComments,
  createComment,
  deleteComment,
} from '../api/comments';
import { toastSuccess, toastError } from '../stores/useToastStore';

export const commentKeys = {
  list: (workspaceId, projectId, taskId) => [
    'comments',
    workspaceId,
    projectId,
    taskId,
  ],
};

export function useComments(workspaceId, projectId, taskId) {
  return useQuery({
    queryKey: commentKeys.list(workspaceId, projectId, taskId),
    queryFn: () => fetchComments(workspaceId, projectId, taskId),
    enabled: !!workspaceId && !!projectId && !!taskId,
  });
}

export function useCreateComment(workspaceId, projectId, taskId, currentUser) {
  const qc = useQueryClient();
  const listKey = commentKeys.list(workspaceId, projectId, taskId);

  return useMutation({
    mutationFn: createComment,

    onMutate: async ({ text }) => {
      await qc.cancelQueries({ queryKey: listKey });
      const prev = qc.getQueryData(listKey);

      const optimistic = {
        _id: `temp-${Date.now()}`,
        text,
        author: currentUser,
        createdAt: new Date().toISOString(),
        __optimistic: true,
      };

      qc.setQueryData(listKey, (old) => [...(old ?? []), optimistic]);

      return { prev, optimisticId: optimistic._id };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(listKey, ctx.prev);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: listKey });
    },
  });
}

export function useDeleteComment(workspaceId, projectId, taskId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: commentKeys.list(workspaceId, projectId, taskId),
      });
      toastSuccess(`Comment deleted successfully!`);
    },
    onError: (error) => {
      toastError(`Failed to delete comment: ${error.message}`);
    }
  });
}