import { FastifyInstance } from 'fastify';
import { Server } from 'socket.io';

declare module 'fastify' {
  interface FastifyInstance {
    io: Server;
  }
}

export function setupSocketIO(fastify: FastifyInstance) {
  const io = new Server(fastify.server, {
    cors: {
      origin: fastify.config.corsOrigins || ['http://localhost:3000'],
      credentials: true,
    },
  });

  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = fastify.jwt.verify(token);
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.id;

    console.log(`User connected: ${userId}`);

    // Join user's personal room
    socket.join(`user-${userId}`);

    // Join conversation room
    socket.on('join-conversation', (otherUserId: string) => {
      const roomId = [userId, otherUserId].sort().join('-');
      socket.join(roomId);
      console.log(`User ${userId} joined conversation with ${otherUserId}`);
    });

    // Leave conversation room
    socket.on('leave-conversation', (otherUserId: string) => {
      const roomId = [userId, otherUserId].sort().join('-');
      socket.leave(roomId);
    });

    // Send message
    socket.on('send-message', (data: { recipientId: string; content: string }) => {
      const roomId = [userId, data.recipientId].sort().join('-');
      io.to(roomId).emit('new-message', {
        senderId: userId,
        recipientId: data.recipientId,
        content: data.content,
        timestamp: new Date().toISOString(),
      });
    });

    // Typing indicator
    socket.on('typing', (recipientId: string) => {
      socket.to(`user-${recipientId}`).emit('user-typing', { userId });
    });

    socket.on('stop-typing', (recipientId: string) => {
      socket.to(`user-${recipientId}`).emit('user-stop-typing', { userId });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  fastify.decorate('io', io);

  fastify.log.info('Socket.IO initialized');
}
