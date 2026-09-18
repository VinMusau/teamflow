import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useUiStore } from '../stores/useUiStore';
import { useWorkspaces } from '../hooks/useWorkspaces';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';
import NotificationBell from '../components/NotificationBell';
import { useRealtime } from '../hooks/useRealtime';


export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const openCreate = useUiStore((s) => s.openCreateWorkspace);

  const { data: workspaces, isLoading, isError, error } = useWorkspaces();
  useRealtime();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold">TeamFlow</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{user?.name}</span>
            <NotificationBell />
            <button
              onClick={logout}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your workspaces</h2>
            <p className="mt-1 text-sm text-slate-400">
              Spaces where you and your team get work done.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            + New workspace
          </button>
        </div>

        <div className="mt-8">
          {isLoading && (
            <p className="text-sm text-slate-400">Loading workspaces…</p>
          )}

          {isError && (
            <p className="text-sm text-red-400">
              {error?.response?.data?.message || error.message}
            </p>
          )}

          {!isLoading && !isError && workspaces?.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center">
              <p className="text-slate-300">No workspaces yet.</p>
              <button
                onClick={openCreate}
                className="mt-3 text-sm text-indigo-400 hover:underline"
              >
                Create your first workspace
              </button>
            </div>
          )}

          {workspaces?.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2">
              {workspaces.map((w) => (
                <li key={w._id}>
                  <Link
                    to={`/workspaces/${w._id}`}
                    className="block rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:border-indigo-600"
                  >
                    <h3 className="font-semibold text-slate-100">{w.name}</h3>
                    {w.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                        {w.description}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-slate-500">
                      {w.members?.length ?? 0} member
                      {(w.members?.length ?? 0) === 1 ? '' : 's'}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <CreateWorkspaceModal />
    </div>
  );
}