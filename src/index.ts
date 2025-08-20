import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { config } from './config';
import { logger } from './utils/logger';
import { corsMiddleware } from './middleware/cors';
import { rateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import healthRoutes from './routes/health';
import gatewayRoutes from './routes/gateway';

class ApiGateway {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(corsMiddleware);
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    

    this.app.use(morgan('combined', {
      skip: (req) => req.path === '/favicon.ico',
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }));
    
    this.app.use(requestLogger);
    
    this.app.use(rateLimiter);
  }

  private setupRoutes(): void {
    this.app.use('/health', healthRoutes);
    
    this.app.use('/api', gatewayRoutes);
    
    // root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'API Gateway is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        services: {
          weather: config.services.weather,
          auth: config.services.auth,
          cache: config.services.cache,
          alert: config.services.alert,
        },
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public start(): void {
    const server = this.app.listen(config.port, () => {
      logger.info(`API Gateway started on port ${config.port}`, {
        port: config.port,
        nodeEnv: config.nodeEnv,
        services: config.services,
      });
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', {
        reason,
        promise,
      });
      process.exit(1);
    });
  }
}

// start the application
const apiGateway = new ApiGateway();
apiGateway.start();
