import type { Server } from 'node:http';
import bcrypt from 'bcryptjs';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from "./config/db.js";
import './config/cloudinary.js';
import { createApp } from './app.js';
import { Admin } from './models/Admin.js';

async function ensureAdmin(): Promise<void> {
  const exists = await Admin.exists({ email: env.ADMIN_EMAIL.toLowerCase() });
  if (exists) return;
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  await Admin.create({ email: env.ADMIN_EMAIL.toLowerCase(), passwordHash });
  console.log(`✅ Admin account created (${env.ADMIN_EMAIL})`);
}

async function bootstrap(): Promise<void> {
  await connectDB();
  await ensureAdmin();

  const app = createApp();
  const server: Server = app.listen(env.PORT, () => {
    console.log(`🚀 Maibi API running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully...`);
    server.close(() => {
      void disconnectDB().then(() => {
        console.log('Closed out remaining connections.');
        process.exit(0);
      });
    });
    // Force-exit if cleanup hangs.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
