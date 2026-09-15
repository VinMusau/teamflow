import { useAuthStore } from '../stores/useAuthStore';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const logout  = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold">TeamFlow</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              {user?.name} · {user?.email}
            </span>
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
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-400">
          Auth is working. Tomorrow we build workspaces.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Signed in as</p>
          <p className="mt-1 text-lg font-medium">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
      </main>
    </div>
  );
}