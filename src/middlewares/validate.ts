import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';

type Source = 'body' | 'query' | 'params';

/**
 * Validate a request part against a zod schema. On success the parsed value is
 * attached to `req.validated` (and, for body/params, written back since those
 * are writable). `req.query` is getter-backed in Express 5, so for query
 * schemas read the result from `req.validated`.
 */
export function validate(schema: ZodType, source: Source = 'body'): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[source]);
    req.validated = parsed;
    if (source !== 'query') {
      (req as unknown as Record<string, unknown>)[source] = parsed;
    }
    next();
  };
}

/** Typed accessor for the validated payload inside a handler. */
export const validated = <T>(req: Request): T => req.validated as T;
