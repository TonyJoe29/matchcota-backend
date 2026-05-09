const { validationResult } = require('express-validator');
const httpError = require('../utils/httpError');

const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(httpError(400, 'Los datos enviados no son validos.', errors.array()));
  }

  next();
};

module.exports = validate;
