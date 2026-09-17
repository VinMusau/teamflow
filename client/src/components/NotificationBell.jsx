import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useUnreadCount,
  useNotifications,
  useMarkRead,
  useMarkAllRead,
} from '../hooks/useNotifications';
import { formatNotification, timeAgo } from '../lib/formatNotification';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: notifications, isLoading } = useNotifications({ enabled: open });
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleClick = async (n) => {
    if (!n.read) {
      await markRead.mutateAsync(n._id);
    }
    setOpen(false);
    navigate(n.link);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"
        aria-label="Notifications"
      >
        <span aria-hidden>🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-100">
              Notifications
            </h3>
            {notifications?.some((n) => !n.read) && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="text-xs text-indigo-400 hover:underline disabled:opacity-50"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <p className="p-4 text-sm text-slate-400">Loading…</p>
            )}

            {!isLoading && notifications?.length === 0 && (
              <p className="p-4 text-sm text-slate-500">
                You're all caught up.
              </p>
            )}

            {notifications?.map((n) => (
              <button
                key={n._id}
                onClick={() => handleClick(n)}
                className={`block w-full border-b border-slate-800 px-4 py-3 text-left text-sm transition hover:bg-slate-800/50 ${
                  n.read ? '' : 'bg-indigo-950/20'
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />
                  )}
                  <div className={n.read ? 'pl-4' : ''}>
                    <p className="text-slate-200">
                      {formatNotification(n)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}