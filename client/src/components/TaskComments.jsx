import { useState } from 'react';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
} from '../hooks/useComments';
import { confirm } from '../stores/useConfirmStore';

export default function TaskComments({
  workspaceId,
  projectId,
  taskId,
  currentUser,
  currentUserRole,
}) {
  const { data: comments, isLoading, isError, error } = useComments(
    workspaceId,
    projectId,
    taskId
  );
  const createComment = useCreateComment(workspaceId, projectId, taskId, currentUser);
  const deleteComment = useDeleteComment(workspaceId, projectId, taskId);

  const [text, setText] = useState('');
  const [postError, setPostError] = useState('');

  const canModerate = ['owner', 'admin'].includes(currentUserRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPostError('');
    try {
      await createComment.mutateAsync({
        workspaceId,
        projectId,
        taskId,
        text: text.trim(),
      });
      setText('');
    } catch (err) {
      console.error('CREATE COMMENT ERROR:', err);
      setPostError(
        err.response?.data?.message || err.message || 'Failed to post'
      );
    }
  };

  const handleDelete = async (comment) => {
    const ok = await confirm({
      title: 'Delete comment?',
      message: `"${comment.text}" will be permanently deleted.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;

    try {
      await deleteComment.mutateAsync({
        workspaceId,
        projectId,
        taskId,
        commentId: comment._id,
      });
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <section className="border-t border-slate-800 pt-5">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">
        Comments{' '}
        {comments && (
          <span className="font-normal text-slate-500">
            ({comments.length})
          </span>
        )}
      </h3>

      {isLoading && (
        <p className="text-sm text-slate-400">Loading comments…</p>
      )}

      {isError && (
        <p className="text-sm text-red-400">
          {error?.response?.data?.message || error.message}
        </p>
      )}

      {!isLoading && !isError && comments?.length === 0 && (
        <p className="text-sm text-slate-500">
          No comments yet. Start the conversation.
        </p>
      )}

      {comments?.length > 0 && (
        <ul className="space-y-3">
          {comments.map((c) => {
            const isMine = c.author._id === currentUser._id;
            const canDelete = isMine || canModerate;
            return (
              <li
                key={c._id}
                className={`rounded-lg border p-3 ${
                  c.__optimistic
                    ? 'border-slate-800 bg-slate-950/50 opacity-70'
                    : 'border-slate-800 bg-slate-950'
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    <span className="font-medium text-slate-200">
                      {c.author.name}
                    </span>{' '}
                    ·{' '}
                    {new Date(c.createdAt).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(c)}
                      className="text-xs text-slate-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-200">
                  {c.text}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          rows={2}
          maxLength={2000}
          className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
        />
        <div className="flex items-center justify-between">
          {postError ? (
            <p className="text-xs text-red-400">{postError}</p>
          ) : (
            <span className="text-xs text-slate-600">
              {text.length}/2000
            </span>
          )}
          <button
            type="submit"
            disabled={!text.trim() || createComment.isPending}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {createComment.isPending ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>
    </section>
  );
}