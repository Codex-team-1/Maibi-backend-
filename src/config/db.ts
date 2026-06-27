import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

/**
 * Connect to MongoDB with bounded retry + exponential backoff. Resolves once
 * connected; rejects after the final attempt so `server.ts` can abort boot.
 */
export async function connectDB(uri: string = env.NODE_ENV === 'production' ? env.PRO_MONGODB_URI : (env.DEV_MONGODB_URI ?? env.PRO_MONGODB_URI)): Promise<void> {
  const maxAttempts = 5;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 20,
      });
      console.log(`✅ MongoDB connected (${mongoose.connection.name})`);
      return;
    } catch (err) {
      const wait = Math.min(1000 * 2 ** (attempt - 1), 15000);
      const message = err instanceof Error ? err.message : String(err);
      console.error(`⚠️  MongoDB connection attempt ${attempt}/${maxAttempts} failed: ${message}`);
      if (attempt >= maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));
mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
}
