import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Wraps an async handler so any rejection is forwarded to the error middleware.
 * Express 5 already forwards rejected promises, but this keeps the intent
 * explicit and works uniformly across versions.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
