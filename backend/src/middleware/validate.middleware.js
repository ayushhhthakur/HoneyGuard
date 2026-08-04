import { ValidationError } from '../core/errors.js';

/**
 * `validate({ body: schema, params: schema, query: schema })` — parses and
 * REPLACES req.body/params/query with the parsed (typed, defaulted,
 * stripped-of-unknown-keys) result. This is the "strict input validation"
 * layer: nothing reaches a controller without having passed a schema first.
 */
export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.params) req.params = schemas.params.parse(req.params);
    if (schemas.query) req.query = schemas.query.parse(req.query);
    if (schemas.body) req.body = schemas.body.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      const details = error.errors.map((e) => ({ path: e.path.join('.'), message: e.message }));
      return next(new ValidationError('Request validation failed', details));
    }
    next(error);
  }
};

export default validate;
