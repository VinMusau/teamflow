import { useState } from 'react';
import Modal from './Modal';
import { useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { PRIORITIES, STATUSES } from '../lib/taskConstants';
import TaskComments from './TaskComments'; 
import { confirm} from '../stores/useConfirmStore';

const toDateInput = (iso) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : '';

export default function TaskDetailsModal({
  task,
  workspaceId,
  projectId,
  members = [],
  currentUser,
  currentUserRole,
  onClose,
}) {
  const updateTask = useUpdateTask(workspaceId, projectId);
  const deleteTask = useDeleteTask(workspaceId, projectId);

  const [form, setForm] = useState({
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    status: task.status,
    assignee: task.assignee?._id ?? '',
    dueDate: toDateInput(task.dueDate),
  });
  const [error, setError] = useState('');

  const isDirty =
    form.title !== task.title ||
    form.description !== (task.description ?? '') ||
    form.priority !== task.priority ||
    form.status !== task.status ||
    form.assignee !== (task.assignee?._id ?? '') ||
    form.dueDate !== toDateInput(task.dueDate);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setError('');

    const statusChanged = form.status !== task.status;

    try {
      await updateTask.mutateAsync({
        workspaceId,
        projectId,
        taskId: task._id,
        title: form.title.trim(),
        description: form.description,
        priority: form.priority,
        status: form.status,
        assignee: form.assignee || null,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        // If the user changed status, push the task to the end of the
        // destination column. Individual drags refine placement later.
        ...(statusChanged && { order: Date.now() }),
      });
      onClose();
    } catch (err) {
      console.error('UPDATE TASK ERROR:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to save'
      );
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete task?',
      message: `"${task.title}" will be permanently deleted.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    
    try {
      await deleteTask.mutateAsync({
        workspaceId,
        projectId,
        taskId: task._id,
      });
      onClose();
    } catch (err) {
      console.error('DELETE TASK ERROR:', err);
      setError(
        err.response?.data?.message || err.message || 'Failed to delete'
      );
    }
  };

  return (
    <Modal open onClose={onClose} title="Task details" size="lg">
      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-slate-300">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={160}
            autoFocus
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={2000}
            rows={4}
            className="mt-1 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300">Assignee</label>
            <select
              name="assignee"
              value={form.assignee}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user._id} value={m.user._id}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300">Due date</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteTask.isPending}
            className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-400 hover:bg-red-950/40 disabled:opacity-50"
          >
            {deleteTask.isPending ? 'Deleting…' : 'Delete'}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isDirty || updateTask.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {updateTask.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </form>

      <TaskComments
        workspaceId={workspaceId}
        projectId={projectId}
        taskId={task._id}
        currentUser={currentUser}
        currentUserRole={currentUserRole}
      />
    </Modal>
  );
}