const { query } = require('../config/db');

const petSelect = `
  SELECT
    p.id, p.owner_id, p.name, p.age, p.gender, p.status, p.photo_url,
    p.health_status, p.special_needs, p.is_sterilized, p.is_vaccinated,
    p.compatible_dogs, p.compatible_cats, p.compatible_children,
    p.description, p.created_at, p.updated_at,
    s.name AS species, b.name AS breed, z.name AS size,
    c.name AS city, c.state AS state,
    u.username AS owner_username
  FROM pets p
  INNER JOIN species s ON s.id = p.species_id
  LEFT JOIN breeds b ON b.id = p.breed_id
  INNER JOIN sizes z ON z.id = p.size_id
  INNER JOIN cities c ON c.id = p.city_id
  INNER JOIN users u ON u.id = p.owner_id
`;

const create = async (data) => {
  const result = await query(
    `INSERT INTO pets (
      owner_id, name, species_id, breed_id, age, gender, size_id, city_id,
      photo_url, health_status, special_needs, is_sterilized, is_vaccinated,
      compatible_dogs, compatible_cats, compatible_children, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.owner_id,
      data.name,
      data.species_id,
      data.breed_id || null,
      data.age,
      data.gender,
      data.size_id,
      data.city_id,
      data.photo_url || null,
      data.health_status || null,
      data.special_needs || null,
      Boolean(data.is_sterilized),
      Boolean(data.is_vaccinated),
      data.compatible_dogs ?? true,
      data.compatible_cats ?? true,
      data.compatible_children ?? true,
      data.description || null
    ]
  );

  return findById(result.insertId);
};

const buildFilters = (filters) => {
  const where = ['p.deleted_at IS NULL'];
  const values = [];

  if (filters.status) {
    where.push('p.status = ?');
    values.push(filters.status);
  } else {
    where.push("p.status = 'disponible'");
  }

  if (filters.species_id) {
    where.push('p.species_id = ?');
    values.push(filters.species_id);
  }

  if (filters.breed_id) {
    where.push('p.breed_id = ?');
    values.push(filters.breed_id);
  }

  if (filters.size_id) {
    where.push('p.size_id = ?');
    values.push(filters.size_id);
  }

  if (filters.city_id) {
    where.push('p.city_id = ?');
    values.push(filters.city_id);
  }

  if (filters.gender) {
    where.push('p.gender = ?');
    values.push(filters.gender);
  }

  if (filters.max_age) {
    where.push('p.age <= ?');
    values.push(Number(filters.max_age));
  }

  return {
    where: where.join(' AND '),
    values
  };
};

const list = async (filters = {}) => {
  const built = buildFilters(filters);
  return query(
    `${petSelect} WHERE ${built.where} ORDER BY p.created_at DESC`,
    built.values
  );
};

const listByOwner = async (ownerId) => {
  return query(
    `${petSelect} WHERE p.owner_id = ? AND p.deleted_at IS NULL ORDER BY p.created_at DESC`,
    [ownerId]
  );
};

const findById = async (id) => {
  const rows = await query(`${petSelect} WHERE p.id = ? AND p.deleted_at IS NULL LIMIT 1`, [id]);
  return rows[0] || null;
};

const update = async (id, data) => {
  const allowed = {
    name: data.name,
    species_id: data.species_id,
    breed_id: data.breed_id,
    age: data.age,
    gender: data.gender,
    size_id: data.size_id,
    city_id: data.city_id,
    status: data.status,
    photo_url: data.photo_url,
    health_status: data.health_status,
    special_needs: data.special_needs,
    is_sterilized: data.is_sterilized,
    is_vaccinated: data.is_vaccinated,
    compatible_dogs: data.compatible_dogs,
    compatible_cats: data.compatible_cats,
    compatible_children: data.compatible_children,
    description: data.description
  };

  const entries = Object.entries(allowed).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    return findById(id);
  }

  const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
  const values = entries.map(([, value]) => value);

  await query(`UPDATE pets SET ${setClause} WHERE id = ?`, [...values, id]);
  return findById(id);
};

const softDelete = async (id) => {
  await query("UPDATE pets SET deleted_at = CURRENT_TIMESTAMP, status = 'inactiva' WHERE id = ?", [id]);
};

module.exports = {
  create,
  list,
  listByOwner,
  findById,
  update,
  softDelete
};
