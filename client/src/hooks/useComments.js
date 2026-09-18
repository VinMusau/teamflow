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

export function useCreateComment(workspaceId, projectId, taskId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: commentKeys.list(workspaceId, projectId, taskId),
      });
      toastSuccess(`Comment created successfully!`);
    },
    onError: (error) => {
      toastError(`Failed to create comment: ${error.message}`);
    }
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