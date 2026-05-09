const petModel = require('../models/pet.model');
const { resolveCatalogId } = require('../models/catalog.model');
const httpError = require('../utils/httpError');

const normalizeGender = (value) => value?.toLowerCase();

const normalizeStatus = (value) => {
  if (!value) {
    return undefined;
  }

  const status = value.toLowerCase();
  return status === 'disponible' ? 'disponible' : status;
};

const resolvePetData = async (body, ownerId = null) => {
  const speciesValue = body.species_id || body.species || body.especie;
  const breedValue = body.breed_id || body.breed || body.raza;
  const sizeValue = body.size_id || body.size || body.tamanio || body.tamano;
  const cityValue = body.city_id || body.city || body.ciudad || body.ubicacion;
  const salud = body.salud || {};
  const compatibilidad = body.compatibilidad || {};

  const data = {
    owner_id: ownerId,
    name: body.name || body.nombre,
    age: body.age ?? body.edad,
    gender: normalizeGender(body.gender || body.genero),
    status: normalizeStatus(body.status || body.estatus),
    photo_url: body.photo_url || body.foto_url || body.foto_mascota,
    health_status: body.health_status || body.estado_salud || salud.estado_salud,
    special_needs: body.special_needs || salud.necesidades_especiales,
    is_sterilized: body.is_sterilized ?? salud.esterilizado,
    is_vaccinated: body.is_vaccinated ?? salud.vacunado,
    compatible_dogs: body.compatible_dogs ?? compatibilidad.perros,
    compatible_cats: body.compatible_cats ?? compatibilidad.gatos,
    compatible_children:
      body.compatible_children ?? compatibilidad.ninos ?? compatibilidad.ninos_pequenos,
    description: body.description || body.descripcion
  };

  if (speciesValue !== undefined) {
    data.species_id = await resolveCatalogId('species', speciesValue);
    if (!data.species_id) {
      throw httpError(400, 'La especie no existe en el catalogo.');
    }
  }

  if (breedValue !== undefined) {
    data.breed_id = await resolveCatalogId('breeds', breedValue);
    if (!data.breed_id) {
      throw httpError(400, 'La raza no existe en el catalogo.');
    }
  }

  if (sizeValue !== undefined) {
    data.size_id = await resolveCatalogId('sizes', sizeValue);
    if (!data.size_id) {
      throw httpError(400, 'El tamanio no existe en el catalogo.');
    }
  }

  if (cityValue !== undefined) {
    data.city_id = await resolveCatalogId('cities', cityValue);
    if (!data.city_id) {
      throw httpError(400, 'La ciudad no existe en el catalogo.');
    }
  }

  return data;
};

const listPets = async (req, res, next) => {
  try {
    const filters = {
      status: normalizeStatus(req.query.status || req.query.estatus || req.query.Estado),
      gender: normalizeGender(req.query.gender || req.query.genero),
      max_age: req.query.max_age || req.query.edad_max
    };

    filters.species_id = await resolveCatalogId(
      'species',
      req.query.species_id || req.query.species || req.query.especie || req.query.Especie
    );
    filters.breed_id = await resolveCatalogId(
      'breeds',
      req.query.breed_id || req.query.breed || req.query.raza || req.query.Raza
    );
    filters.size_id = await resolveCatalogId(
      'sizes',
      req.query.size_id || req.query.size || req.query.tamanio || req.query.Tamanio
    );
    filters.city_id = await resolveCatalogId(
      'cities',
      req.query.city_id || req.query.city || req.query.ciudad || req.query.Ciudad
    );

    const pets = await petModel.list(filters);
    res.json({ data: pets });
  } catch (error) {
    next(error);
  }
};

const getPet = async (req, res, next) => {
  try {
    const pet = await petModel.findById(req.params.id);

    if (!pet) {
      throw httpError(404, 'Mascota no encontrada.');
    }

    res.json({ pet });
  } catch (error) {
    next(error);
  }
};

const createPet = async (req, res, next) => {
  try {
    const data = await resolvePetData(req.body, req.user.id);
    const pet = await petModel.create(data);

    res.status(201).json({
      message: 'Mascota registrada exitosamente.',
      pet
    });
  } catch (error) {
    next(error);
  }
};

const updatePet = async (req, res, next) => {
  try {
    const pet = await petModel.findById(req.params.id);

    if (!pet) {
      throw httpError(404, 'Mascota no encontrada.');
    }

    if (pet.owner_id !== req.user.id && req.user.role !== 'admin') {
      throw httpError(403, 'No tienes permiso para editar esta mascota.');
    }

    const data = await resolvePetData(req.body);
    const updatedPet = await petModel.update(req.params.id, data);

    res.json({
      message: 'Mascota actualizada correctamente.',
      pet: updatedPet
    });
  } catch (error) {
    next(error);
  }
};

const deletePet = async (req, res, next) => {
  try {
    const pet = await petModel.findById(req.params.id);

    if (!pet) {
      throw httpError(404, 'Mascota no encontrada.');
    }

    if (pet.owner_id !== req.user.id && req.user.role !== 'admin') {
      throw httpError(403, 'No tienes permiso para eliminar esta mascota.');
    }

    await petModel.softDelete(req.params.id);
    res.json({ message: 'Mascota eliminada logicamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listPets,
  getPet,
  createPet,
  updatePet,
  deletePet
};
