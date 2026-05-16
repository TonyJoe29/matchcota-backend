const alertModel = require('../models/alert.model');
const { resolveCatalogId } = require('../models/catalog.model');
const httpError = require('../utils/httpError');

const resolveMany = async (catalogName, values = []) => {
  if (!Array.isArray(values)) {
    return [];
  }

  const resolved = [];

  for (const value of values) {
    const id = await resolveCatalogId(catalogName, value);
    if (!id) {
      throw httpError(400, `Valor de catálogo inválido: ${value}.`);
    }
    resolved.push(id);
  }

  return resolved;
};

const normalizeAlertBody = async (body) => {
  const preferences = body.preferences || body.preferencias || {};
  const ageRange = preferences.age_range || preferences.rango_edad || {};

  return {
    active: body.active ?? body.alertas_activas,
    species_ids: await resolveMany('species', preferences.species || preferences.especies),
    breed_ids: await resolveMany('breeds', preferences.breeds || preferences.razas),
    city_ids: await resolveMany('cities', preferences.cities || preferences.ciudades),
    min_age: body.min_age ?? preferences.min_age ?? ageRange.min,
    max_age: body.max_age ?? preferences.max_age ?? ageRange.max
  };
};

const upsertAlert = async (req, res, next) => {
  try {
    const data = await normalizeAlertBody(req.body);
    const alert = await alertModel.upsert(req.user.id, data);

    res.json({
      message: 'Preferencias de alerta actualizadas correctamente.',
      alert
    });
  } catch (error) {
    next(error);
  }
};

const getAlert = async (req, res, next) => {
  try {
    const alert = await alertModel.findByUser(req.user.id);
    res.json({ alert });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upsertAlert,
  getAlert
};
