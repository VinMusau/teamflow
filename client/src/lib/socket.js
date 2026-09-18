import { io } from 'socket.io-client';
import { useTokenStore } from '../stores/useTokenStore';

let socket = null;

export const connectSocket = () => {
  try {
    const token = useTokenStore.getState().token;
    if (!token) return null;
    if (socket?.connected) return socket;

    socket = io('/', {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connect error:', err.message);
    });

    return socket;
  } catch (err) {
    console.warn('connectSocket failed:', err.message);
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
  }
};

export const getSocket = () => socket;