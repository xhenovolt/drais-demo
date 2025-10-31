import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

export class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer | null = null;
  private userSockets: Map<number, string[]> = new Map(); // userId -> socket ids

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.io.use(this.authenticateSocket.bind(this));

    this.io.on('connection', (socket) => {
      const userId = socket.data.userId;
      console.log(`User ${userId} connected: ${socket.id}`);

      // Track user socket
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId)?.push(socket.id);

      // Join user room
      socket.join(`user:${userId}`);

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected: ${socket.id}`);
        const sockets = this.userSockets.get(userId) || [];
        const index = sockets.indexOf(socket.id);
        if (index > -1) {
          sockets.splice(index, 1);
          if (sockets.length === 0) {
            this.userSockets.delete(userId);
          }
        }
      });

      // Handle notification acknowledgments
      socket.on('notification:ack', (data) => {
        console.log(`Notification ${data.notificationId} acknowledged by user ${userId}`);
      });

      // Handle real-time requests
      socket.on('notifications:subscribe', () => {
        socket.join(`notifications:${userId}`);
      });

      socket.on('notifications:unsubscribe', () => {
        socket.leave(`notifications:${userId}`);
      });
    });

    console.log('Socket.IO server initialized');
  }

  private async authenticateSocket(socket: any, next: any) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        throw new Error('No authentication token provided');
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      // Attach user data to socket
      socket.data.userId = decoded.userId;
      socket.data.schoolId = decoded.schoolId;
      
      next();
    } catch (error) {
      console.error('Socket authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  }

  emitToUser(userId: number, event: string, data: any) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  emitToSchool(schoolId: number, event: string, data: any) {
    if (this.io) {
      this.io.to(`school:${schoolId}`).emit(event, data);
    }
  }

  emitToAll(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId) && (this.userSockets.get(userId)?.length || 0) > 0;
  }

  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }
}

export default SocketService;
