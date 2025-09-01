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
      if (!route) throw new Error(`No route found for path: ${req.originalUrl}`);

      const serviceUrl = this.getServiceUrl(route.service);
      if (!serviceUrl) throw new Error(`Service URL not configured for: ${route.service}`);

      if (!route.methods.includes(req.method)) {
        throw new Error(`Method ${req.method} not allowed for ${route.path}`);
      }

      // Parse seguro do caminho e da query
      const parsed = new URL(req.originalUrl, 'http://gateway.local'); // base dummy
      const pathAfterApi = parsed.pathname.replace(/^\/api(\/|$)/, '/'); // ex.: "/weather"
      const queryObj = Object.fromEntries(parsed.searchParams.entries());

      // ---- NOVO: montagem específica p/ weather ----
      let upstreamPath = pathAfterApi;
      if (route.service === 'weather') {
        const weatherPrefix = process.env.WEATHER_PATH_PREFIX ?? ''; // ex.: "/weather" ou ""
        // cidade pode vir como "?city=" (ou "?q=" se preferir)
        const city = (queryObj.city ?? queryObj.q ?? '').toString().trim();

        if (city) {
          // /<prefix>/current/:city
          upstreamPath = `${weatherPrefix}/current/${encodeURIComponent(city)}`;
          // removemos a city/q da query para não duplicar
          delete queryObj.city;
          delete queryObj.q;
        } else {
          // Se não veio city e o cliente tentou um subpath já pronto (/weather/current/Recife),
          // apenas preprend o prefix (se houver). Ex.: "/weather/current/Recife"
          if (pathAfterApi === '/weather' || pathAfterApi === '/') {
            // Nenhuma info suficiente — responda 400 amigável
            return {
              status: 400,
              headers: { 'content-type': 'application/json' },
              data: { error: 'missing_city', message: 'Provide ?city=NomeDaCidade' },
            };
          }
          upstreamPath = `${weatherPrefix}${pathAfterApi}`;
        }
      }

      // URL final SEM query; passamos query via axios params
      const targetUrl = new URL(upstreamPath, serviceUrl.replace(/\/+$/, '')).toString();

      // Limpa headers hop-by-hop
      const headers: Record<string, string> = {};
      for (const [k, v] of Object.entries(req.headers || {})) {
        const key = k.toLowerCase();
        if (['host', 'connection', 'content-length'].includes(key)) continue;
        if (Array.isArray(v)) headers[key] = v.join(',');
        else if (v !== undefined) headers[key] = String(v);
      }
      headers['x-forwarded-for'] = headers['x-forwarded-for'] || headers['x-real-ip'] || '';
      headers['x-gateway-service'] = 'api-gateway';

      const upper = req.method.toUpperCase();
      const hasBody = !['GET', 'HEAD'].includes(upper);

      const axiosConfig: AxiosRequestConfig = {
        method: upper as AxiosRequestConfig['method'],
        url: targetUrl,
        headers,
        params: Object.keys(queryObj).length ? queryObj : undefined,
        data: hasBody ? req.body : undefined,
        timeout: 10000,
      };

      logger.info(`Proxy → ${route.service}`, { method: upper, targetUrl });

      const response: AxiosResponse = await axios(axiosConfig);

      const responseTime = Date.now() - startTime;
      logger.info(`Proxy OK`, { service: route.service, statusCode: response.status, responseTime });

      return {
        status: response.status,
        data: response.data,
        headers: response.headers as Record<string, string>,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error(`Proxy FAIL`, {
        originalUrl: req.originalUrl,
        method: req.method,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      });

      if (axios.isAxiosError(error)) {
        return {
          status: error.response?.status || 500,
          data: { error: 'Service unavailable', message: error.message },
          headers: {},
        };
      }

      return {
        status: 500,
        data: { error: 'Service unavailable', message: (error as Error)?.message || 'Unknown error' },
        headers: {},
      };
    }
  }

  public getServiceRoutes(): ServiceRoute[] {
    return this.serviceRoutes;
  }
}
