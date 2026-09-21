import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import { allowedOrigins } from './cors.js';

let io = null;

export const getIo = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name email');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    socket.join(`user:${socket.user._id}`);

    const workspaces = await Workspace.find({
      'members.user': socket.user._id,
    }).select('_id');

    for (const w of workspaces) {
      socket.join(`workspace:${w._id}`);
    }
  });

  return io;
};

export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

export const emitToWorkspace = (workspaceId, event, payload) => {
  if (!io) return;
  io.to(`workspace:${workspaceId}`).emit(event, payload);
};