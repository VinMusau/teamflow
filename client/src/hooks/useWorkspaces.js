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
    },
  });
}

export function useUpdateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateWorkspace,
    onSuccess: (workspace) => {
      qc.invalidateQueries({ queryKey: workspaceKeys.all });
      qc.setQueryData(workspaceKeys.detail(workspace._id), workspace);
    },
  });
}

export function useDeleteWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}

export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addMember,
    onSuccess: (workspace) => {
      qc.setQueryData(workspaceKeys.detail(workspace._id), workspace);
    },
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeMember,
    onSuccess: (workspace) => {
      qc.setQueryData(workspaceKeys.detail(workspace._id), workspace);
    },
  });
}