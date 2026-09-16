import api from './axios';

export const fetchActivities = async ({ workspaceId, limit = 30, before }) => {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit);
  if (before) params.set('before', before);
  const res = await api.get(
    `/workspaces/${workspaceId}/activities?${params.toString()}`
  );
  return res.data; 
};