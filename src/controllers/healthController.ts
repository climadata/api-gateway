import { Request, Response } from 'express';
import { HealthCheckService } from '../services/healthCheck';
import { logger } from '../utils/logger';

export class HealthController {
  private healthCheckService: HealthCheckService;

  constructor() {
    this.healthCheckService = new HealthCheckService();
  }

  public async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const healthChecks = await this.healthCheckService.checkAllServices();
      
      const allHealthy = healthChecks.every(check => check.status === 'healthy');
      const overallStatus = allHealthy ? 'healthy' : 'unhealthy';

      res.json({
        status: overallStatus,
        timestamp: new Date().toISOString(),
        services: healthChecks,
        gateway: {
          status: 'healthy',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        },
      });

    } catch (error) {
      logger.error('Health check error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        status: 'unhealthy',
        error: 'Failed to check services health',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async getServiceHealth(req: Request, res: Response): Promise<void> {
    try {
      const { service } = req.params;
      
      if (!service) {
        res.status(400).json({
          error: 'Service name is required',
        });
        return;
      }

      const healthCheck = await this.healthCheckService.checkServiceHealth(service);
      
      res.json({
        ...healthCheck,
      });

    } catch (error) {
      logger.error('Service health check error', {
        service: req.params.service,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        error: 'Failed to check service health',
        service: req.params.service,
      });
    }
  }

  public getServicesList(req: Request, res: Response): void {
    const services = this.healthCheckService.getServicesList();
    
    res.json({
      services,
      count: services.length,
    });
  }
}
