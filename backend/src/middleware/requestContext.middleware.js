import { randomUUID } from 'crypto';
import { logger } from '../core/logger.js';

/**
 * Stamps every request with a correlation ID and a request-scoped child
 * logger (req.log), so every log line for a request can be grepped together
 * and the ID can be echoed back to the client for support/bug reports.
 */
export const requestContext = (req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('x-request-id', req.id);
  req.log = logger.child({ requestId: req.id });
  next();
};

export default requestContext;
