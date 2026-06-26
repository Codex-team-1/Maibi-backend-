import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../services/token.service.js';

/** Require a valid Bearer JWT; attaches `req.admin`. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing or malformed Authorization header');
  }
  try {
    req.admin = verifyToken(header.slice(7).trim());
    next();
  } catch {
    throw AppError.unauthorized('Invalid or expired token');
  }
}
