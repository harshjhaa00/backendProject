// src/middleware/validate.middleware.js
// Helper to run express-validator chains and standardize responses.

import { validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(422).json({
      message: 'Validation failed.',
      errors: errors.array(),
    });
  };
};

export default validate;

