import type { Request } from 'express';

/** Read a route param that validation has guaranteed is present, as a string. */
export const param = (req: Request, name: string): string => String(req.params[name] ?? '');

/** Read a numeric route param (validation guarantees it is a positive int). */
export const numParam = (req: Request, name: string): number => Number(req.params[name]);
