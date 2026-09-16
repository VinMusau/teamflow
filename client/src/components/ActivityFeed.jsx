import { useActivities } from '../hooks/useActivities';
import { formatActivity, timeAgo } from '../lib/formatActivity';

export default function ActivityFeed({ workspaceId }) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useActivities(workspaceId, { limit: 20 });

  const activities = data?.pages.flatMap((p) => p.activities) ?? [];

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-lg font-semibold">Activity</h2>

      {isLoading && (
        <p className="mt-4 text-sm text-slate-400">Loading activity…</p>
      )}

      {isError && (
        <p className="mt-4 text-sm text-red-400">
          {error?.response?.data?.message || error.message}
        </p>
      )}

      {!isLoading && !isError && activities.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">
          No activity yet. It'll show up here as your team works.
        </p>
      )}

      {activities.length > 0 && (
        <>
          <ul className="mt-4 space-y-3">
            {activities.map((a) => (
              <li key={a._id} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="text-slate-200">
                    <span className="font-medium text-slate-100">
                      {a.actor?.name ?? 'Someone'}
                    </span>{' '}
                    <span className="text-slate-400">
                      {formatActivity(a)}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {timeAgo(a.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="mt-4 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50"
            >
              {isFetchingNextPage ? 'Loading…' : 'Load more'}
            </button>
          )}
        </>
      )}
    </section>
  );
}