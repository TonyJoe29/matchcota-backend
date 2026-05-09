const { query } = require('../config/db');

const selectSafeUser = `
  SELECT
    u.id, u.username, u.email, u.name, u.birth_date, u.location,
    u.profile_photo_url, u.occupation, u.housing_type,
    u.available_space_type, u.available_space_m2,
    u.daily_available_hours, u.monthly_income_mxn,
    u.pet_experience, u.current_pets, u.has_children_under_12,
    u.status, u.created_at, r.name AS role
  FROM users u
  INNER JOIN roles r ON r.id = u.role_id
`;

const findByEmail = async (email) => {
  const rows = await query(
    `SELECT
      u.id, u.username, u.email, u.password_hash, u.name, u.status,
      r.name AS role
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    WHERE u.email = ?
    LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

const findByUsername = async (username) => {
  const rows = await query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
  return rows[0] || null;
};

const findById = async (id) => {
  const rows = await query(`${selectSafeUser} WHERE u.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
};

const create = async (data) => {
  const rows = await query('SELECT id FROM roles WHERE name = ? LIMIT 1', ['usuario']);
  const roleId = rows[0]?.id || 3;

  const result = await query(
    `INSERT INTO users (
      username, email, password_hash, name, birth_date, location, role_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.username,
      data.email,
      data.passwordHash,
      data.name,
      data.birth_date || null,
      data.location || null,
      roleId
    ]
  );

  return findById(result.insertId);
};

const updateProfile = async (id, data) => {
  const fields = {
    name: data.name,
    birth_date: data.birth_date,
    location: data.location,
    profile_photo_url: data.profile_photo_url,
    occupation: data.occupation,
    housing_type: data.housing_type,
    available_space_type: data.available_space_type,
    available_space_m2: data.available_space_m2,
    daily_available_hours: data.daily_available_hours,
    monthly_income_mxn: data.monthly_income_mxn,
    pet_experience: data.pet_experience,
    current_pets: data.current_pets,
    has_children_under_12: data.has_children_under_12
  };

  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);

  if (!entries.length) {
    return findById(id);
  }

  const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
  const values = entries.map(([, value]) => value);

  await query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
  return findById(id);
};

const list = async () => {
  return query(`${selectSafeUser} WHERE u.deleted_at IS NULL ORDER BY u.created_at DESC`);
};

const updateRole = async (id, roleName) => {
  const roles = await query('SELECT id FROM roles WHERE name = ? LIMIT 1', [roleName]);

  if (!roles[0]) {
    return null;
  }

  await query('UPDATE users SET role_id = ? WHERE id = ?', [roles[0].id, id]);
  return findById(id);
};

const updateStatus = async (id, status) => {
  await query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
  return findById(id);
};

module.exports = {
  create,
  findByEmail,
  findByUsername,
  findById,
  updateProfile,
  list,
  updateRole,
  updateStatus
};
