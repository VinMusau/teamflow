import { create } from 'zustand';
import api from '../api/axios';
import { getToken, setToken, clearToken } from '../lib/tokenStorage';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  initialize: async () => {
    const token = getToken();
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user, loading: false });
    } catch {
      clearToken();
      set({ user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.data.token);
    set({ user: res.data.user });
    return res.data.user;
  },

  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    setToken(res.data.token);
    set({ user: res.data.user });
    return res.data.user;
  },

  logout: () => {
    clearToken();
    set({ user: null });
  },
}));