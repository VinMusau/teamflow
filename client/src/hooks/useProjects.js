import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  fetchProjects,
  fetchProject,
  createProject,
  updateProject,
  deleteProject,
} from '../api/projects';

export const projectKeys = {
  list: (workspaceId) => ['projects', workspaceId],
  detail: (workspaceId, projectId) => ['projects', workspaceId, projectId],
};

export function useProjects(workspaceId) {
  return useQuery({
    queryKey: projectKeys.list(workspaceId),
    queryFn: () => fetchProjects(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useProject({ workspaceId, projectId }) {
  return useQuery({
    queryKey: projectKeys.detail(workspaceId, projectId),
    queryFn: () => fetchProject({ workspaceId, projectId }),
    enabled: !!workspaceId && !!projectId,
  });
}

export function useCreateProject(workspaceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: projectKeys.list(workspaceId) });
      qc.setQueryData(
        projectKeys.detail(workspaceId, project._id),
        project
      );
    },
  });
}

export function useUpdateProject(workspaceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProject,
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: projectKeys.list(workspaceId) });
      qc.setQueryData(
        projectKeys.detail(workspaceId, project._id),
        project
      );
    },
  });
}

export function useDeleteProject(workspaceId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.list(workspaceId) });
    },
  });
}