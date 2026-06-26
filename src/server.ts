import type { Server } from 'node:http';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from "./config/db.js";
import './config/cloudinary.js';
import { createApp } from './app.js';

async function bootstrap(): Promise<void> {
  await connectDB();

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
