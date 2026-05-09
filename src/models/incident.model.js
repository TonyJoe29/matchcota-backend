const { query } = require('../config/db');

const create = async (data) => {
  const result = await query(
    `INSERT INTO support_incidents (
      user_id, type, subject, description, related_type, related_id
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.user_id,
      data.type,
      data.subject,
      data.description,
      data.related_type || null,
      data.related_id || null
    ]
  );

  return findById(result.insertId);
};

const findById = async (id) => {
  const rows = await query(
    `SELECT i.*, u.username
     FROM support_incidents i
     INNER JOIN users u ON u.id = i.user_id
     WHERE i.id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
};

const list = async () => {
  return query(
    `SELECT i.*, u.username
     FROM support_incidents i
     INNER JOIN users u ON u.id = i.user_id
     ORDER BY i.created_at DESC`
  );
};

const updateStatus = async (id, status) => {
  await query('UPDATE support_incidents SET status = ? WHERE id = ?', [status, id]);
  return findById(id);
};

module.exports = {
  create,
  findById,
  list,
  updateStatus
};
