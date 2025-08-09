import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import { ProxyRequest, ProxyResponse, ServiceRoute } from '../types';

export class ProxyService {
  private serviceRoutes: ServiceRoute[] = [
    {
      path: '/api/weather',
      service: 'weather',
      methods: ['GET', 'POST'],
    },
    {
      path: '/api/auth',
      service: 'auth',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      auth: true,
    },
    {
      path: '/api/cache',
      service: 'cache',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
    {
      path: '/api/alerts',
      service: 'alert',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      auth: true,
    },
  ];

  private getServiceUrl(serviceName: string): string {
    const serviceUrls: Record<string, string> = {
      weather: config.services.weather,
      auth: config.services.auth,
      cache: config.services.cache,
      alert: config.services.alert,
    };

    return serviceUrls[serviceName] || '';
  }

  private findServiceRoute(path: string): ServiceRoute | null {
    return this.serviceRoutes.find(route => path.startsWith(route.path)) || null;
  }

  public async proxyRequest(req: ProxyRequest): Promise<ProxyResponse> {
    const startTime = Date.now();
    
    try {
      const route = this.findServiceRoute(req.originalUrl);
      
      if (!route) {
        throw new Error(`No route found for path: ${req.originalUrl}`);
      }

      const serviceUrl = this.getServiceUrl(route.service);
      if (!serviceUrl) {
        throw new Error(`Service URL not configured for: ${route.service}`);
      }

      // Check if method is allowed
      if (!route.methods.includes(req.method)) {
        throw new Error(`Method ${req.method} not allowed for ${route.path}`);
      }

      // Build target URL
      let targetPath = req.originalUrl.replace(route.path, '');
      
      // Para o weather service, adiciona o prefixo /weather
      if (route.service === 'weather') {
        targetPath = `/weather${targetPath}`;
      }
      
      const targetUrl = `${serviceUrl}${targetPath}`;

      // Prepare axios config
      const axiosConfig: AxiosRequestConfig = {
        method: req.method,
        url: targetUrl,
        headers: {
          ...req.headers,
          'x-forwarded-for': req.headers['x-forwarded-for'] || req.headers['x-real-ip'],
          'x-gateway-service': 'api-gateway',
        },
        params: req.query,
        data: req.body,
        timeout: 10000, // 10 seconds timeout
      };

      logger.info(`Proxying request to ${route.service}`, {
        method: req.method,
        targetUrl,
        service: route.service,
      });

      const response: AxiosResponse = await axios(axiosConfig);
      
      const responseTime = Date.now() - startTime;
      
      logger.info(`Request completed successfully`, {
        service: route.service,
        statusCode: response.status,
        responseTime,
      });

      return {
        status: response.status,
        data: response.data,
        headers: response.headers as Record<string, string>,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      logger.error(`Proxy request failed`, {
        originalUrl: req.originalUrl,
        method: req.method,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      });

      if (axios.isAxiosError(error)) {
        return {
          status: error.response?.status || 500,
          data: {
            error: 'Service unavailable',
            message: error.message,
          },
          headers: {},
        };
      }

      throw error;
    }
  }

  public getServiceRoutes(): ServiceRoute[] {
    return this.serviceRoutes;
  }
}
