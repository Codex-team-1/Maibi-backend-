import 'express';

declare global {
  namespace Express {
    interface Request {
      /** Set by `requireAuth` after a valid JWT. */
      admin?: { id: string; email: string };
      /** Parsed/validated payload set by the `validate` middleware. */
      validated?: unknown;
    }
  }
}

export {};
