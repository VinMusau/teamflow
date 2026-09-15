import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTokenStore = create(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
    }),
    {
      name: 'teamflow_token',
      partialize: (state) => ({ token: state.token }),
    }
  )
);