import { fail } from '../core/ApiResponse.js';
import { AppError } from '../core/errors.js';
import { logger } from '../core/logger.js';

/**
 * Every error in the app funnels here (via asyncHandler or Express's own
 * sync-handler catch). Operational errors (AppError and subclasses) are
 * logged at warn and their message is safe to show the client. Anything
 * else is a bug: logged at error with a stack trace, and the client only
 * ever sees a generic "Internal server error" — no stack traces, no raw
 * driver error messages, ever leave this process.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (error, req, res, next) => {
  const log = req.log || logger;

  if (error instanceof AppError) {
    log.warn({ err: error.message, code: error.code, path: req.originalUrl }, 'Operational error');
    return fail(res, error);
  }

  if (error.name === 'MulterError') {
    log.warn({ err: error.message, path: req.originalUrl }, 'Upload error');
    return fail(res, { statusCode: 400, message: error.message, code: 'UPLOAD_ERROR' });
  }

  log.error({ err: error.message, stack: error.stack, path: req.originalUrl }, 'Unhandled error');
  return fail(res, { statusCode: 500, message: 'Internal server error', code: 'INTERNAL_ERROR', expose: false });
};

export const notFoundHandler = (req, res) => {
  fail(res, { statusCode: 404, message: 'Not found', code: 'NOT_FOUND' });
};

export default errorHandler;
