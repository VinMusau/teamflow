import { useEffect } from 'react';
import { useConfirmStore } from '../stores/useConfirmStore';

export default function ConfirmDialog() {
  const state = useConfirmStore((s) => s.state);
  const close = useConfirmStore((s) => s._close);

  useEffect(() => {
    if (!state) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, close]);

  if (!state) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
      <div
        className="absolute inset-0"
        onClick={() => close(false)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-100">{state.title}</h2>
        {state.message && (
          <p className="mt-2 text-sm text-slate-400">{state.message}</p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => close(false)}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={() => close(true)}
            autoFocus
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
              state.destructive
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}