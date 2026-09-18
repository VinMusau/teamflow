import { create } from 'zustand';

let nextId = 1;

export const useToastStore = create((set) => ({
  toasts: [],

  toast: (message, type = 'info', duration = 4000) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
    return id;
  },

  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Convenience hooks — call from anywhere in the app
export const toastSuccess = (msg) => useToastStore.getState().toast(msg, 'success');
export const toastError = (msg) => useToastStore.getState().toast(msg, 'error');
export const toastInfo = (msg) => useToastStore.getState().toast(msg, 'info');