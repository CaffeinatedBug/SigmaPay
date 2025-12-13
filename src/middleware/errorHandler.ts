/**
 * ===========================================
 * Error Handling Middleware
 * ===========================================
 * 
 * Centralized error handling for the Express application.
 * Converts various error types into consistent API responses.
 */

import { Request, Response, NextFunction } from 'express';
import { PaymentVerificationError } from '../types/ergo.types';

/**
 * Standard error response structure
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Global error handling middleware
 * 
 * This middleware catches all errors thrown in route handlers
 * and converts them into consistent JSON responses.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[ErrorHandler] Error caught:', err);

  // Handle our custom PaymentVerificationError
  if (err instanceof PaymentVerificationError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON in request body',
      },
    };

    res.status(400).json(response);
    return;
  }

  // Handle all other errors as internal server errors
  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An internal server error occurred' 
        : err.message,
    },
  };

  res.status(500).json(response);
}

/**
 * 404 Not Found handler
 * 
 * This middleware handles requests to undefined routes.
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  };

  res.status(404).json(response);
}
