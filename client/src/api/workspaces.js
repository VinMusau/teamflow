import api from './axios';

export const fetchWorkspaces = async () => {
  const res = await api.get('/workspaces');
  return res.data.workspaces;
};

export const fetchWorkspace = async (id) => {
  const res = await api.get(`/workspaces/${id}`);
  return res.data.workspace;
};

export const createWorkspace = async (payload) => {
  const res = await api.post('/workspaces', payload);
  return res.data.workspace;
};

export const updateWorkspace = async ({ id, ...payload }) => {
  const res = await api.patch(`/workspaces/${id}`, payload);
  return res.data.workspace;
};

export const deleteWorkspace = async (id) => {
  const res = await api.delete(`/workspaces/${id}`);
  return res.data;
};

export const addMember = async ({ workspaceId, email, role }) => {
  const res = await api.post(`/workspaces/${workspaceId}/members`, { email, role });
  return res.data.workspace;
};

export const removeMember = async ({ workspaceId, userId }) => {
  const res = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
  return res.data.workspace;
};