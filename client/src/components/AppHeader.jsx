import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useAuthStore } from '../stores/useAuthStore';

export default function AppHeader({ backTo, backLabel }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="border-b border-slate-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {backTo ? (
          <Link
            to={backTo}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            ← {backLabel}
          </Link>
        ) : (
          <Link
            to="/dashboard"
            className="text-lg font-semibold text-slate-100"
          >
            TeamFlow
          </Link>
        )}

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-400 sm:inline">
            {user?.name}
          </span>
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
  );
}