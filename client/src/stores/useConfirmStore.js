import { create } from 'zustand';

export const useConfirmStore = create((set) => ({
  state: null, // { title, message, confirmLabel, resolve }

  _open: (config) =>
    new Promise((resolve) => {
      set({
        state: {
          title: config.title ?? 'Are you sure?',
          message: config.message ?? '',
          confirmLabel: config.confirmLabel ?? 'Confirm',
          destructive: config.destructive ?? false,
          resolve,
        },
      });
    }),

  _close: (result) =>
    set((s) => {
      s.state?.resolve(result);
      return { state: null };
    }),
}));

// Call this anywhere — it returns a Promise<boolean>
export const confirm = (config) => useConfirmStore.getState()._open(config);