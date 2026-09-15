import { useState } from 'react';
import Modal from './Modal';
import { useCreateWorkspace } from '../hooks/useWorkspaces';
import { useUiStore } from '../stores/useUiStore';

export default function CreateWorkspaceModal() {
  const open = useUiStore((s) => s.createWorkspaceOpen);
  const close = useUiStore((s) => s.closeCreateWorkspace);
  const createWorkspace = useCreateWorkspace();

  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createWorkspace.mutateAsync(form);
      setForm({ name: '', description: '' });
      close();
    } catch (err) {
      console.error('CREATE WORKSPACE ERROR:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create');
    }
  };

  const handleClose = () => {
    setError('');
    setForm({ name: '', description: '' });
    close();
  };

  return (
    <Modal open={open} onClose={handleClose} title="New workspace">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm text-slate-300">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            maxLength={80}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={300}
            rows={3}
            className="mt-1 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={createWorkspace.isPending}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {createWorkspace.isPending ? 'Creating…' : 'Create workspace'}
        </button>
      </form>
    </Modal>
  );
}