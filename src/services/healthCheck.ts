import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import { HealthCheck } from '../types';

export class HealthCheckService {
  private services: Record<string, string> = {
    weather: config.services.weather,
    auth: config.services.auth,
    cache: config.services.cache,
    alert: config.services.alert,
  };

  public async checkServiceHealth(serviceName: string): Promise<HealthCheck> {
    const startTime = Date.now();
    const serviceUrl = this.services[serviceName];

    if (!serviceUrl) {
      return {
        service: serviceName,
        status: 'unhealthy',
        responseTime: 0,
        timestamp: new Date(),
      };
    }

    try {
      const response = await axios.get(`${serviceUrl}/health`, {
        timeout: 5000, // 5 seconds timeout
      });

      const responseTime = Date.now() - startTime;

      const healthCheck: HealthCheck = {
        service: serviceName,
        status: response.status === 200 ? 'healthy' : 'unhealthy',
        responseTime,
        timestamp: new Date(),
      };

      logger.info(`Health check for ${serviceName}`, healthCheck);

      return healthCheck;

    } catch (error) {
      const responseTime = Date.now() - startTime;

      logger.error(`Health check failed for ${serviceName}`, {
        service: serviceName,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      });

      return {
        service: serviceName,
        status: 'unhealthy',
        responseTime,
        timestamp: new Date(),
      };
    }
  }

  public async checkAllServices(): Promise<HealthCheck[]> {
    const healthChecks: HealthCheck[] = [];

    for (const serviceName of Object.keys(this.services)) {
      const healthCheck = await this.checkServiceHealth(serviceName);
      healthChecks.push(healthCheck);
    }

    return healthChecks;
  }

  public getServicesList(): string[] {
    return Object.keys(this.services);
  }
}
