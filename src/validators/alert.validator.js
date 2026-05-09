const { body } = require('express-validator');

const alertValidator = [
  body('active').optional().isBoolean(),
  body('alertas_activas').optional().isBoolean(),
  body('min_age').optional().isInt({ min: 0 }),
  body('max_age').optional().isInt({ min: 0 })
];

module.exports = {
  alertValidator
};
