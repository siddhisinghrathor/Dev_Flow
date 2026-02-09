import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';

export class WebSocketService {
    private io: SocketIOServer;
    private userSockets: Map<string, Set<string>> = new Map();

    constructor(httpServer: HTTPServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: config.cors.origin,
                credentials: true,
            },
        });

        this.setupMiddleware();
        this.setupEventHandlers();
    }

    private setupMiddleware() {
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication error'));
            }

            try {
                const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
                socket.data.userId = decoded.userId;
                next();
            } catch (error) {
                next(new Error('Authentication error'));
            }
        });
    }

    private setupEventHandlers() {
        this.io.on('connection', (socket) => {
            const userId = socket.data.userId;
            logger.info(`User connected: ${userId} (${socket.id})`);

            // Track user sockets
            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, new Set());
            }
            this.userSockets.get(userId)!.add(socket.id);

            // Join user's personal room
            socket.join(`user:${userId}`);

            // Handle disconnection
            socket.on('disconnect', () => {
                logger.info(`User disconnected: ${userId} (${socket.id})`);
                const userSocketSet = this.userSockets.get(userId);
                if (userSocketSet) {
                    userSocketSet.delete(socket.id);
                    if (userSocketSet.size === 0) {
                        this.userSockets.delete(userId);
                    }
                }
            });

            // Handle timer sync
            socket.on('timer:sync', (data) => {
                socket.to(`user:${userId}`).emit('timer:update', data);
            });

            // Handle task updates
            socket.on('task:update', (data) => {
                socket.to(`user:${userId}`).emit('task:updated', data);
            });
        });
    }

    // Emit events to specific users
    emitToUser(userId: string, event: string, data: any) {
        this.io.to(`user:${userId}`).emit(event, data);
    }

    // Broadcast task updates
    broadcastTaskUpdate(userId: string, task: any) {
        this.emitToUser(userId, 'task:updated', task);
    }

    // Broadcast timer updates
    broadcastTimerUpdate(userId: string, timer: any) {
        this.emitToUser(userId, 'timer:updated', timer);
    }

    // Broadcast goal updates
    broadcastGoalUpdate(userId: string, goal: any) {
        this.emitToUser(userId, 'goal:updated', goal);
    }

    // Broadcast notifications
    broadcastNotification(userId: string, notification: any) {
        this.emitToUser(userId, 'notification:new', notification);
    }

    // Get connected users count
    getConnectedUsersCount(): number {
        return this.userSockets.size;
    }

    // Check if user is online
    isUserOnline(userId: string): boolean {
        return this.userSockets.has(userId);
    }
}

let websocketService: WebSocketService;

export const initializeWebSocket = (httpServer: HTTPServer): WebSocketService => {
    websocketService = new WebSocketService(httpServer);
    logger.info('WebSocket service initialized');
    return websocketService;
};

export const getWebSocketService = (): WebSocketService => {
    if (!websocketService) {
        throw new Error('WebSocket service not initialized');
    }
    return websocketService;
};
