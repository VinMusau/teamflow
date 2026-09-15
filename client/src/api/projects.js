import api from './axios';

const base = (workspaceId) => `/workspaces/${workspaceId}/projects`;

export const fetchProjects = async (workspaceId) => {
  const res = await api.get(base(workspaceId));
  return res.data.projects;
};

export const fetchProject = async ({ workspaceId, projectId }) => {
  const res = await api.get(`${base(workspaceId)}/${projectId}`);
  return res.data.project;
};

export const createProject = async ({ workspaceId, ...payload }) => {
  const res = await api.post(base(workspaceId), payload);
  return res.data.project;
};

export const updateProject = async ({ workspaceId, projectId, ...payload }) => {
  const res = await api.patch(`${base(workspaceId)}/${projectId}`, payload);
  return res.data.project;
};

export const deleteProject = async ({ workspaceId, projectId }) => {
  const res = await api.delete(`${base(workspaceId)}/${projectId}`);
  return res.data;
};