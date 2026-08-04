import pino from 'pino';
import { env } from '../config/env.js';

/**
 * Single logger instance for the whole app. Structured (JSON in production,
 * pretty-printed in dev), with automatic redaction of anything that looks
 * like a secret so a stray `logger.info({ req })` can't leak credentials.
 *
 * Nothing outside this file should call console.log/warn/error — that's the
 * "logging abstraction" requirement: swapping the underlying library (or
 * shipping logs to Datadog/Loki/whatever) only ever touches this file.
 */
export const logger = pino({
  level: env.logLevel,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.pass',
      '*.token',
      '*.access_token',
      '*.refresh_token',
      '*.service_role_key',
      '*.SUPABASE_SERVICE_ROLE_KEY',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },
  base: { service: 'honeyguard-api' },
  transport: env.isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname,service' },
      },
});

/** Scoped child logger — e.g. logger.child('TokenService') — so every line
 * carries which module emitted it without repeating it manually everywhere. */
export const createLogger = (scope) => logger.child({ scope });

export default logger;
