const { body } = require('express-validator');

const incidentValidator = [
  body('type').optional().isIn(['error', 'queja', 'sugerencia']),
  body('tipo').optional().isIn(['error', 'queja', 'sugerencia']),
  body().custom((value) => {
    if (!value.type && !value.tipo) {
      throw new Error('type o tipo es obligatorio.');
    }
    return true;
  }),
  body('subject').optional().isLength({ min: 5 }),
  body('asunto').optional().isLength({ min: 5 }),
  body('description').optional().isLength({ min: 10 }),
  body('descripcion').optional().isLength({ min: 10 })
];

module.exports = {
  incidentValidator
};
