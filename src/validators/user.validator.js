const { body } = require('express-validator');

const updateProfileValidator = [
  body('email').not().exists().withMessage('email no se edita desde perfil.'),
  body('username').not().exists().withMessage('username no se edita desde perfil.'),
  body('available_space_m2').optional().isInt({ min: 0 }),
  body('daily_available_hours').optional().isInt({ min: 0, max: 24 }),
  body('monthly_income_mxn').optional().isFloat({ min: 0 }),
  body('profile_photo_url').optional().isURL().withMessage('profile_photo_url debe ser URL valida.')
];

module.exports = {
  updateProfileValidator
};
