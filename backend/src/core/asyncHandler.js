/**
 * `router.get('/x', asyncHandler(async (req, res) => {...}))`
 *
 * Express doesn't forward rejected promises to error middleware on its own
 * (pre-v5). Every controller in this codebase is async; wrapping once here
 * beats a try/catch-and-next() block copy-pasted into every handler.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
