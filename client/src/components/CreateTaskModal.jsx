import { useState } from 'react';
import Modal from './Modal';
import { useCreateTask } from '../hooks/useTasks';
import { useUiStore } from '../stores/useUiStore';
import { PRIORITIES, STATUSES } from '../lib/taskConstants';

export default function CreateTaskModal({
  workspaceId,
  projectId,
  members = [],
}) {
  const status = useUiStore((s) => s.createTaskStatus);
  const close = useUiStore((s) => s.closeCreateTask);
  const createTask = useCreateTask(workspaceId, projectId);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignee: '',
    status: 'todo',
  });
  const [error, setError] = useState('');

  const open = status !== null;

  const initialStatus = status || 'todo';

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createTask.mutateAsync({
        workspaceId,
        projectId,
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: initialStatus,
        dueDate: form.dueDate || null,
        assignee: form.assignee || null,
      });
      setForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assignee: '',
        status: 'todo',
      });
      close();
    } catch (err) {
      console.error('CREATE TASK ERROR:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create');
    }
  };

  const handleClose = () => {
    setError('');
    close();
  };

  return (
    <Modal open={open} onClose={handleClose} title="New task">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            rows={3}
            className="mt-1 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm text-slate-300">Status</label>
            <select
              name="status"
              value={initialStatus}
              disabled
              className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-400 outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <button
          type="submit"
          disabled={createTask.isPending}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {createTask.isPending ? 'Creating…' : 'Create task'}
        </button>
      </form>
    </Modal>
  );
}