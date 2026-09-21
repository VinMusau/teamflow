import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useTokenStore } from '../stores/useTokenStore';

let socket = null;

export const useSocketStore = create((set) => ({
  status: 'disconnected', // 'disconnected' | 'connecting' | 'connected'
  setStatus: (status) => set({ status }),
}));

export const connectSocket = () => {
  try {
    const token = useTokenStore.getState().token;
    if (!token) return null;
    if (socket?.connected) return socket;

    useSocketStore.getState().setStatus('connecting');

    socket = io(import.meta.env.VITE_API_URL || '/', {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      useSocketStore.getState().setStatus('connected');
    });

    socket.on('disconnect', () => {
      useSocketStore.getState().setStatus('disconnected');
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connect error:', err.message);
      useSocketStore.getState().setStatus('disconnected');
    });

    return socket;
  } catch (err) {
    console.warn('connectSocket failed:', err.message);
    useSocketStore.getState().setStatus('disconnected');
    return null;
  }
};

export const disconnectSocket = () => {
  try {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }
  } catch (err) {
    console.warn('disconnectSocket failed:', err.message);
  } finally {
    useSocketStore.getState().setStatus('disconnected');
  }
};

export const getSocket = () => socket;