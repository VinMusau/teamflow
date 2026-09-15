import { create } from 'zustand';
import api from '../api/axios';
import { useTokenStore } from './useTokenStore';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  initialize: async () => {
    const token = useTokenStore.getState().token;
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user, loading: false });
    } catch {
      useTokenStore.getState().clearToken();
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    useTokenStore.getState().setToken(res.data.token);
    set({ user: res.data.user });
    return res.data.user;
  },

  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    useTokenStore.getState().setToken(res.data.token);
    set({ user: res.data.user });
    return res.data.user;
  },

  logout: () => {
    useTokenStore.getState().clearToken();
    set({ user: null });
  },
}));