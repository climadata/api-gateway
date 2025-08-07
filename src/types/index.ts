export interface ServiceConfig {
  weather: string;
  auth: string;
  cache: string;
  alert: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface Config {
  port: number;
  nodeEnv: string;
  services: ServiceConfig;
  rateLimit: RateLimitConfig;
  logLevel: string;
  corsOrigin: string;
  healthCheckInterval: number;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  timestamp: Date;
}

export interface ProxyRequest {
  originalUrl: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
}

export interface ProxyResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
}

export interface ServiceRoute {
  path: string;
  service: string;
  methods: string[];
  auth?: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}
