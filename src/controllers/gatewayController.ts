import { Request, Response, NextFunction } from 'express';
import { ProxyService } from '../services/proxy';
import { logger } from '../utils/logger';
import { ProxyRequest } from '../types';

export class GatewayController {
  private proxyService: ProxyService;

  constructor() {
    this.proxyService = new ProxyService();
  }

  public async proxyRequest(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const proxyRequest: ProxyRequest = {
        originalUrl: req.originalUrl,
        method: req.method,
        headers: req.headers as Record<string, string>,
        body: req.body,
        query: req.query as Record<string, string>,
      };

      const response = await this.proxyService.proxyRequest(proxyRequest);

      // Set response headers
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      res.status(response.status).json(response.data);

    } catch (error) {
      logger.error('Gateway controller error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method,
      });

      res.status(500).json({
        error: 'Gateway Error',
        message: 'Failed to proxy request to service',
      });
    }
  }

  public getRoutes(req: Request, res: Response): void {
    const routes = this.proxyService.getServiceRoutes();
    
    res.json({
      message: 'Available API Gateway routes',
      routes: routes.map(route => ({
        path: route.path,
        service: route.service,
        methods: route.methods,
        requiresAuth: route.auth || false,
      })),
    });
  }
}
