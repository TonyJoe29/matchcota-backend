const { body } = require('express-validator');

const createAdoptionValidator = [
  body('pet_id').optional().isInt({ min: 1 }),
  body('id_mascota').optional().isInt({ min: 1 }),
  body().custom((value) => {
    if (!value.pet_id && !value.id_mascota) {
      throw new Error('pet_id o id_mascota es obligatorio.');
    }
    return true;
  }),
  body('motivation').optional().isLength({ min: 10 }),
  body('motivacion').optional().isLength({ min: 10 }),
  body().custom((value) => {
    if (!value.motivation && !value.motivacion) {
      throw new Error('motivation o motivacion es obligatorio.');
    }
    return true;
  })
];

const updateStatusValidator = [
  body('status')
    .optional()
    .isIn(['pendiente', 'en_proceso', 'aprobada', 'rechazada', 'cancelada']),
  body('estatus')
    .optional()
    .isIn(['pendiente', 'en_proceso', 'aprobada', 'rechazada', 'cancelada']),
  body().custom((value) => {
    if (!value.status && !value.estatus) {
      throw new Error('status o estatus es obligatorio.');
    }
    return true;
  })
];

module.exports = {
  createAdoptionValidator,
  updateStatusValidator
};
