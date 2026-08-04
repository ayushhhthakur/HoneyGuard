// Entry point only: load config, build the app, start listening, handle
// shutdown. All actual wiring lives in src/app.js so the app itself is
// importable (and testable) without binding a port.
import 'dotenv/config';
import { env } from './src/config/env.js';
import { createApp } from './src/app.js';
import { logger } from './src/core/logger.js';

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info({ port: env.port, env: env.nodeEnv }, 'HoneyGuard API listening');
});

const shutdown = (signal) => {
  logger.info({ signal }, 'Shutting down gracefully');
  server.close(() => process.exit(0));
  // Force-exit if graceful shutdown hangs
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error.message, stack: error.stack }, 'Uncaught exception — exiting');
  process.exit(1);
});
