const { body } = require('express-validator');

const registerValidator = [
  body('username').trim().notEmpty().withMessage('username es obligatorio.'),
  body('email').isEmail().withMessage('email no es valido.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('password debe tener minimo 8 caracteres.'),
  body().custom((value) => {
    if (!value.name && !value.nombre) {
      throw new Error('name o nombre es obligatorio.');
    }
    return true;
  })
];

const loginValidator = [
  body('email').isEmail().withMessage('email no es valido.'),
  body('password').notEmpty().withMessage('password es obligatorio.')
];

module.exports = {
  registerValidator,
  loginValidator
};
