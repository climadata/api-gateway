import cors from 'cors';
import { config } from '../config';

export const corsMiddleware = cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'x-forwarded-for',
    'x-real-ip',
  ],
});
