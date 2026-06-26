import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { MulterError } from 'multer';
import { AppError } from '../utils/AppError.js';
import { isProd } from '../config/env.js';

interface ErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Central error handler. Must keep the 4-arg signature so Express treats it as
 * an error middleware. Maps known error types to clean JSON; hides internals in
 * production.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  let status = 500;
  let body: ErrorBody = { code: 'INTERNAL_ERROR', message: 'Something went wrong' };

  if (err instanceof AppError) {
    status = err.status;
    body = { code: err.code, message: err.message };
    if (err.details !== undefined) body.details = err.details;
  } else if (err instanceof ZodError) {
    status = 400;
    body = { code: 'VALIDATION_ERROR', message: 'Invalid request', details: err.flatten() };
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    body = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid data',
      details: Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message])),
    };
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    body = { code: 'INVALID_ID', message: `Invalid value for ${err.path}` };
  } else if (err instanceof MulterError) {
    status = 400;
    body = { code: `UPLOAD_${err.code}`, message: err.message };
  } else if (isDuplicateKeyError(err)) {
    status = 409;
    body = { code: 'DUPLICATE_KEY', message: 'Resource already exists' };
  }

  if (status >= 500) {
    console.error('Unhandled error:', err);
    if (isProd) body.message = 'Internal server error';
  }

  res.status(status).json({ error: body });
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}
