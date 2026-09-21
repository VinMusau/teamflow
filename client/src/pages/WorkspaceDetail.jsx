import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useWorkspace,
  useAddMember,
  useRemoveMember,
} from '../hooks/useWorkspaces';
import { useProjects } from '../hooks/useProjects';
import { useAuthStore } from '../stores/useAuthStore';
import { useUiStore } from '../stores/useUiStore';
import CreateProjectModal from '../components/CreateProjectModal';
import ActivityFeed from '../components/ActivityFeed';
import AppHeader from '../components/AppHeader';
import { confirm } from '../stores/useConfirmStore';
import { WorkspaceCardSkeleton, SkeletonLine } from '../components/Skeleton';
import { toastError } from '../stores/useToastStore';

export default function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const currentUser = useAuthStore((s) => s.user);
  const openCreateProject = useUiStore((s) => s.openCreateProject);

  const { data: workspace, isLoading, isError, error } = useWorkspace(workspaceId);
  const { data: projects, isLoading: loadingProjects } = useProjects(workspaceId);
  const addMember = useAddMember();
  const removeMember = useRemoveMember();

  const [email, setEmail] = useState('');
  const [inviteError, setInviteError] = useState('');

  if (isLoading) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppHeader backTo="/dashboard" backLabel="Back to dashboard" />
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <div>
          <SkeletonLine className="h-7 w-48" />
          <SkeletonLine className="mt-2 h-4 w-72" />
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <SkeletonLine className="h-6 w-24" />
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <li key={i}>
                <WorkspaceCardSkeleton />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <SkeletonLine className="h-6 w-24" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonLine key={i} className="h-10 w-full" />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-950 p-10 text-red-400">
        {error?.response?.data?.message || error.message}
      </div>
    );
  }

  const myMembership = workspace.members.find(
    (m) => m.user._id === currentUser._id
  );
  const canInvite = ['owner', 'admin'].includes(myMembership?.role);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    try {
      await addMember.mutateAsync({ workspaceId, email, role: 'member' });
      setEmail('');
    } catch (err) {
      setInviteError(err.response?.data?.message || err.message || 'Failed');
    }
  };

  const handleRemove = async (userId) => {
    const ok = await confirm({
      title: 'Remove member?',
      message: `This member will be removed from the workspace.`,
      confirmLabel: 'Remove',
      destructive: true,
    });
    if (!ok) return;
    try {
      await removeMember.mutateAsync({ workspaceId, userId });
    } catch (err) {
      toastError(err.response?.data?.message || err.message || 'Failed to remove member');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
          <AppHeader 
            backTo="/dashboard" 
            backLabel="Back to dashboard" 
          />

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{workspace.name}</h1>
          {workspace.description && (
            <p className="mt-1 text-sm text-slate-400">
              {workspace.description}
            </p>
          )}
        </div>

        {/* Projects */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Projects</h2>
            <button
              onClick={openCreateProject}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              + New project
            </button>
          </div>

          {loadingProjects && (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <li key={i}>
                  <WorkspaceCardSkeleton />
                </li>
              ))}
            </ul>
          )}

          {!loadingProjects && projects?.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-slate-800 p-8 text-center">
              <p className="text-sm text-slate-400">
                No projects yet. Create one to get started.
              </p>
            </div>
          )}

          {projects?.length > 0 && (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {projects.map((p) => (
                <li key={p._id}>
                  <Link
                    to={`/workspaces/${workspaceId}/projects/${p._id}`}
                    className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 hover:border-indigo-600"
                  >
                    <span
                      className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <div className="min-w-0">
                      <h3 className="truncate font-medium text-slate-100">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Members */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Members</h2>

          <ul className="mt-4 divide-y divide-slate-800">
            {workspace.members.map((m) => (
              <li
                key={m.user._id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium">{m.user.name}</p>
                  <p className="text-xs text-slate-500">{m.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-300">
                    {m.role}
                  </span>
                  {canInvite &&
                    m.user._id !== workspace.owner._id &&
                    m.user._id !== currentUser._id && (
                      <button
                        onClick={() => handleRemove(m.user._id)}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                </div>
              </li>
            ))}
          </ul>

          {canInvite && (
            <form onSubmit={handleInvite} className="mt-6 flex gap-2">
              <input
                type="email"
                placeholder="teammate@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={addMember.isPending}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {addMember.isPending ? 'Inviting…' : 'Invite'}
              </button>
            </form>
          )}

          {inviteError && (
            <p className="mt-2 text-sm text-red-400">{inviteError}</p>
          )}
        </section>
        {/* Activity */}
        <ActivityFeed workspaceId={workspaceId} />
      </main>

      <CreateProjectModal workspaceId={workspaceId} />
    </div>
  );
}