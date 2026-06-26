import type { Request, Response } from 'express';

/** Catch-all 404 for unmatched routes (mounted with no path under Express 5). */
export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` },
  });
}
