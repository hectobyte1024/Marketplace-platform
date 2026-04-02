import { Server as SocketIOServer, Socket } from 'socket.io';
import http from 'http';
import authService from './services/auth.js';

// Extend Socket type
interface AuthenticatedSocket extends Socket {
  userId?: string;
}

let io: SocketIOServer;
const userSockets = new Map<string, string[]>(); // userId -> [socketIds]

export const initializeSocket = (server: http.Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: ['http://localhost:3001', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
    },
  });

  // Middleware for authentication
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('No token provided'));
      }

      const payload = authService.verifyToken(token);
      if (!payload) {
        return next(new Error('Invalid token'));
      }

      (socket as AuthenticatedSocket).userId = payload.userId;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    if (!socket.userId) {
      socket.disconnect();
      return;
    }

    console.log(`User ${socket.userId} connected with socket ${socket.id}`);

    // Track user sockets
    if (!userSockets.has(socket.userId)) {
      userSockets.set(socket.userId, []);
    }
    userSockets.get(socket.userId)!.push(socket.id);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle disconnect
    socket.on('disconnect', () => {
      const userId = socket.userId!;
      console.log(`User ${userId} disconnected`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        const index = sockets.indexOf(socket.id);
        if (index > -1) {
          sockets.splice(index, 1);
        }
        if (sockets.length === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });

  return io;
};

export const getIO = () => io;

export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToWorkspace = (workspaceId: string, event: string, data: any) => {
  if (io) {
    io.to(`workspace:${workspaceId}`).emit(event, data);
  }
};

export const broadcastAvailability = (workspaceId: string, data: any) => {
  if (io) {
    io.to(`workspace:${workspaceId}`).emit('availability-updated', data);
  }
};

export const broadcastBookingUpdate = (bookingId: string, workspaceId: string, data: any) => {
  if (io) {
    io.to(`workspace:${workspaceId}`).emit('booking-updated', {
      bookingId,
      ...data,
    });
  }
};
