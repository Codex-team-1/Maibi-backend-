import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayload {
  id: string;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  const expiresIn = env.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>;
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === 'string' || !decoded.id || !decoded.email) {
    throw new Error('Malformed token payload');
  }
  return { id: String(decoded.id), email: String(decoded.email) };
}
