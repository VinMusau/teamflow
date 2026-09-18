import { useToastStore } from '../stores/useToastStore';

const styles = {
  success: 'border-emerald-800 bg-emerald-950/60 text-emerald-200',
  error: 'border-red-800 bg-red-950/60 text-red-200',
  info: 'border-slate-700 bg-slate-900 text-slate-200',
};

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2 text-sm shadow-xl ${styles[t.type]}`}
        >
          <p className="flex-1">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="rounded p-0.5 text-xs opacity-60 hover:opacity-100"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}