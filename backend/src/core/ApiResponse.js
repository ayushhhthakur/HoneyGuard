/**
 * Every controller responds through these two helpers so the response shape
 * is identical everywhere: { success, data | error, meta? }. The frontend
 * has depended on `{ success, data }` since day one — these preserve that
 * exact envelope, they just stop every route from hand-rolling it.
 */
export const ok = (res, data, { status = 200, meta } = {}) => {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
};

export const created = (res, data, meta) => ok(res, data, { status: 201, meta });

export const noContent = (res) => res.status(204).send();

export const fail = (res, error) => {
  const status = error.statusCode || 500;
  const body = {
    success: false,
    error: error.expose === false ? 'Internal server error' : error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR',
  };
  if (error.details) body.details = error.details;
  return res.status(status).json(body);
};
