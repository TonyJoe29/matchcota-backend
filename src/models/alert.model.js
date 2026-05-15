const { query } = require('../config/db');

const upsert = async (userId, data) => {
  const speciesIds = data.species_ids ? JSON.stringify(data.species_ids) : null;
  const breedIds = data.breed_ids ? JSON.stringify(data.breed_ids) : null;
  const cityIds = data.city_ids ? JSON.stringify(data.city_ids) : null;

  await query(
    `INSERT INTO alert_preferences (
      user_id, active, species_ids, breed_ids, city_ids, min_age, max_age
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      active = excluded.active,
      species_ids = excluded.species_ids,
      breed_ids = excluded.breed_ids,
      city_ids = excluded.city_ids,
      min_age = excluded.min_age,
      max_age = excluded.max_age,
      updated_at = CURRENT_TIMESTAMP`,
    [
      userId,
      data.active ?? true,
      speciesIds,
      breedIds,
      cityIds,
      data.min_age ?? null,
      data.max_age ?? null
    ]
  );

  return findByUser(userId);
};

const parseJson = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return [];
  }
};

const findByUser = async (userId) => {
  const rows = await query(
    'SELECT * FROM alert_preferences WHERE user_id = ? LIMIT 1',
    [userId]
  );
  const alert = rows[0] || null;

  if (!alert) {
    return null;
  }

  return {
    ...alert,
    species_ids: parseJson(alert.species_ids),
    breed_ids: parseJson(alert.breed_ids),
    city_ids: parseJson(alert.city_ids)
  };
};

module.exports = {
  upsert,
  findByUser
};
