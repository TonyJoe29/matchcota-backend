const { query } = require('../config/db');

const catalogs = {
  species: 'species',
  breeds: 'breeds',
  sizes: 'sizes',
  cities: 'cities'
};

const getCatalog = async (catalogName) => {
  const table = catalogs[catalogName];

  if (!table) {
    return [];
  }

  if (table === 'breeds') {
    return query(`
      SELECT b.id, b.name, b.species_id, s.name AS species
      FROM breeds b
      INNER JOIN species s ON s.id = b.species_id
      ORDER BY b.name
    `);
  }

  return query(`SELECT * FROM ${table} ORDER BY name`);
};

const normalizeName = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.split(',')[0].trim();
};

const resolveCatalogId = async (catalogName, value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (Number.isInteger(Number(value))) {
    return Number(value);
  }

  const table = catalogs[catalogName];

  if (!table) {
    return null;
  }

  const rows = await query(
    `SELECT id FROM ${table} WHERE LOWER(name) = LOWER(?) LIMIT 1`,
    [normalizeName(value)]
  );

  return rows[0]?.id || null;
};

module.exports = {
  getCatalog,
  resolveCatalogId
};
