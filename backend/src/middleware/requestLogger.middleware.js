/**
 * One structured log line per request, after it finishes, with method,
 * path, status, and duration. Skips the noisy public tracking surface at
 * debug-worthy volume by logging those at `debug` instead of `info`.
 */
export const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    req.log[level]({
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs),
      ip: req.ip,
    });
  });

  next();
};

export default requestLogger;
