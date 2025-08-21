import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ErrorResponse } from '../types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  const errorResponse: ErrorResponse = {
    error: 'Internal Server Error',
    message: error.message,
    statusCode: 500,
    timestamp: new Date().toISOString(),
  };

  res.status(500).json(errorResponse);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const errorResponse: ErrorResponse = {
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(errorResponse);
};
