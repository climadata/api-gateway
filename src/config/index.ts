import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // microservices URLs
  services: {
    weather: process.env.WEATHER_SERVICE_URL || 'http://localhost:3001',
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
    cache: process.env.CACHE_SERVICE_URL || 'http://localhost:3003',
    alert: process.env.ALERT_SERVICE_URL || 'http://localhost:3004',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  
  logLevel: process.env.LOG_LEVEL || 'info',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3005',
  healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000'),
};
