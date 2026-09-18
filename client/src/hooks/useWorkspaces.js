import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  fetchWorkspaces,
  fetchWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
} from '../api/workspaces';
import { activityKeys } from './useActivities';
import { toastSuccess, toastError } from '../stores/useToastStore';

export const workspaceKeys = {
  all: ['workspaces'],
  detail: (id) => ['workspaces', id],
};

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: fetchWorkspaces,
  });
}

export function useWorkspace(id) {
  return useQuery({
    queryKey: workspaceKeys.detail(id),
    queryFn: () => fetchWorkspace(id),
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: (workspace) => {
      qc.invalidateQueries({ queryKey: workspaceKeys.all });
      qc.setQueryData(workspaceKeys.detail(workspace._id), workspace);
      qc.invalidateQueries({ queryKey: activityKeys.list(workspace._id) });
      toastSuccess(`Workspace "${workspace.name}" created successfully!`);
    },
    onError: (error) => {
      toastError(`Failed to create workspace: ${error.message}`);
    }
  });
}

export function useUpdateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateWorkspace,
    onSuccess: (workspace) => {
      qc.invalidateQueries({ queryKey: workspaceKeys.all });
      qc.setQueryData(workspaceKeys.detail(workspace._id), workspace);
      qc.invalidateQueries({ queryKey: activityKeys.list(workspaceId) });
      toastSuccess(`Workspace "${workspace.name}" updated successfully!`);
    },
    onError: (error) => {
      toastError(`Failed to update workspace: ${error.message}`);
    }
  });
}

export function useDeleteWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workspaceKeys.all });
      qc.invalidateQueries({ queryKey: activityKeys.list(workspaceId) });
      toastSuccess(`Workspace deleted successfully!`);
    },
    onError: (error) => {
      toastError(`Failed to delete workspace: ${error.message}`);
    }
  });
}

export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addMember,
    onSuccess: (workspace) => {
      qc.setQueryData(workspaceKeys.detail(workspace._id), workspace);
      qc.invalidateQueries({ queryKey: activityKeys.list(workspaceId) });
      toastSuccess(`Member added successfully!`);
    },
    onError: (error) => {
      toastError(`Failed to add member: ${error.message}`);
    }
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeMember,
    onSuccess: (workspace) => {
      qc.setQueryData(workspaceKeys.detail(workspace._id), workspace);
      qc.invalidateQueries({ queryKey: activityKeys.list(workspaceId) });
      toastSuccess(`Member removed successfully!`);
    },
    onError: (error) => {
      toastError(`Failed to remove member: ${error.message}`);
    }
  });
}