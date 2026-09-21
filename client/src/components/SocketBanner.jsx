import { useSocketStore } from '../lib/socket';
import { useAuthStore } from '../stores/useAuthStore';

export default function SocketBanner() {
  const status = useSocketStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  if (!user || status !== 'disconnected') return null;

  return (
    <div className="fixed left-1/2 top-2 z-[90] -translate-x-1/2 rounded-full border border-amber-800 bg-amber-950/80 px-4 py-1.5 text-xs text-amber-200 shadow-lg backdrop-blur">
      <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400 align-middle" />
      Reconnecting to realtime updates…
    </div>
  );
}