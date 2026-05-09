const { body, query } = require('express-validator');

const hasAny = (...keys) => {
  return (_value, { req }) => {
    const exists = keys.some((key) => req.body[key] !== undefined && req.body[key] !== '');
    if (!exists) {
      throw new Error(`Falta uno de estos campos: ${keys.join(', ')}.`);
    }
    return true;
  };
};

const createPetValidator = [
  body('name').optional().trim(),
  body('nombre').optional().trim(),
  body().custom((value) => {
    if (!value.name && !value.nombre) {
      throw new Error('name o nombre es obligatorio.');
    }
    return true;
  }),
  body().custom(hasAny('species_id', 'species', 'especie')),
  body().custom(hasAny('size_id', 'size', 'tamanio', 'tamano')),
  body().custom(hasAny('city_id', 'city', 'ciudad', 'ubicacion')),
  body('age').optional().isInt({ min: 0 }).withMessage('age debe ser entero positivo.'),
  body('edad').optional().isInt({ min: 0 }).withMessage('edad debe ser entero positivo.'),
  body().custom((value) => {
    if (value.age === undefined && value.edad === undefined) {
      throw new Error('age o edad es obligatorio.');
    }
    return true;
  }),
  body('gender').optional().isIn(['macho', 'hembra', 'Macho', 'Hembra']),
  body('genero').optional().isIn(['macho', 'hembra', 'Macho', 'Hembra']),
  body().custom((value) => {
    if (!value.gender && !value.genero) {
      throw new Error('gender o genero es obligatorio.');
    }
    return true;
  }),
  body('photo_url').optional().isURL(),
  body('foto_url').optional().isURL(),
  body('foto_mascota').optional().isURL()
];

const updatePetValidator = [
  body('age').optional().isInt({ min: 0 }),
  body('edad').optional().isInt({ min: 0 }),
  body('gender').optional().isIn(['macho', 'hembra', 'Macho', 'Hembra']),
  body('genero').optional().isIn(['macho', 'hembra', 'Macho', 'Hembra']),
  body('status').optional().isIn(['disponible', 'en_proceso', 'adoptada', 'inactiva']),
  body('estatus').optional().isIn(['disponible', 'en_proceso', 'adoptada', 'inactiva', 'Disponible'])
];

const listPetsValidator = [
  query('max_age').optional().isInt({ min: 0 }),
  query('edad_max').optional().isInt({ min: 0 })
];

module.exports = {
  createPetValidator,
  updatePetValidator,
  listPetsValidator
};
