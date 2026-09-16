import api from './axios';

const base = (workspaceId, projectId, taskId) =>
  `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`;

export const fetchComments = async (workspaceId, projectId, taskId) => {
  const res = await api.get(base(workspaceId, projectId, taskId));
  return res.data.comments;
};

export const createComment = async ({
  workspaceId,
  projectId,
  taskId,
  text,
}) => {
  const res = await api.post(base(workspaceId, projectId, taskId), { text });
  return res.data.comment;
};

export const deleteComment = async ({
  workspaceId,
  projectId,
  taskId,
  commentId,
}) => {
  const res = await api.delete(
    `${base(workspaceId, projectId, taskId)}/${commentId}`
  );
  return res.data;
};