import api from './axios';

const base = (workspaceId, projectId) =>
  `/workspaces/${workspaceId}/projects/${projectId}/tasks`;

export const fetchTasks = async (workspaceId, projectId) => {
  const res = await api.get(base(workspaceId, projectId));
  return res.data.tasks;
};

export const createTask = async ({ workspaceId, projectId, ...payload }) => {
  const res = await api.post(base(workspaceId, projectId), payload);
  return res.data.task;
};

export const updateTask = async ({
  workspaceId,
  projectId,
  taskId,
  ...payload
}) => {
  const res = await api.patch(
    `${base(workspaceId, projectId)}/${taskId}`,
    payload
  );
  return res.data.task;
};

export const deleteTask = async ({ workspaceId, projectId, taskId }) => {
  const res = await api.delete(`${base(workspaceId, projectId)}/${taskId}`);
  return res.data;
};