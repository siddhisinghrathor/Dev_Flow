import express, { Application } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { disconnectDatabase } from './config/database';
import { initializeWebSocket } from './websocket';
import routes from './routes';

class Server {
    private app: Application;
    private httpServer: http.Server;

    constructor() {
        this.app = express();
        this.httpServer = http.createServer(this.app);

        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        this.setupWebSocket();
    }

    private setupMiddleware() {
        // Security
        this.app.use(helmet());

        // CORS
        this.app.use(cors({
            origin: config.cors.origin,
            credentials: true,
        }));

        // Compression
        this.app.use(compression());

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));



        // Request logging
        this.app.use((req, _res, next) => {
            logger.http(`${req.method} ${req.url}`);
            next();
        });
    }

    private setupRoutes() {
        // API routes
        this.app.use(`/api/${config.apiVersion}`, routes);

        // Root endpoint
        this.app.get('/', (_req, res) => {
            res.json({
                success: true,
                message: 'DevFlow API Server',
                version: config.apiVersion,
                environment: config.env,
            });
        });

        // 404 handler
        this.app.use((_req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found',
            });
        });
    }

    private setupErrorHandling() {
        this.app.use(errorHandler);
    }

    private setupWebSocket() {
        initializeWebSocket(this.httpServer);
    }

    public async start() {
        try {
            this.httpServer.listen(config.port, () => {
                logger.info(`🚀 Server running on port ${config.port}`);
                logger.info(`📡 Environment: ${config.env}`);
                logger.info(`🔗 API: http://localhost:${config.port}/api/${config.apiVersion}`);
                logger.info(`💾 Database: Connected`);
                logger.info(`🔌 WebSocket: Ready`);
            });

            // Graceful shutdown
            process.on('SIGTERM', () => this.shutdown('SIGTERM'));
            process.on('SIGINT', () => this.shutdown('SIGINT'));
        } catch (error) {
            logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    private async shutdown(signal: string) {
        logger.info(`${signal} received, shutting down gracefully...`);

        this.httpServer.close(async () => {
            logger.info('HTTP server closed');

            await disconnectDatabase();

            logger.info('Shutdown complete');
            process.exit(0);
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
            logger.error('Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    }
}

// Start server
const server = new Server();
server.start();

export default server;
