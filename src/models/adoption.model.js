const { query, transaction } = require('../config/db');
const httpError = require('../utils/httpError');

const activeStatuses = ['pendiente', 'en_proceso'];

const adoptionSelect = `
  SELECT
    a.id, a.user_id, a.pet_id, a.motivation, a.home_suitable,
    a.special_care_experience, a.message, a.status, a.created_at, a.updated_at,
    p.name AS pet_name, p.status AS pet_status, p.photo_url AS pet_photo_url,
    u.username AS requester_username
  FROM adoption_requests a
  INNER JOIN pets p ON p.id = a.pet_id
  INNER JOIN users u ON u.id = a.user_id
`;

const create = async (data) => {
  const pets = await query(
    'SELECT id, status FROM pets WHERE id = ? AND deleted_at IS NULL LIMIT 1',
    [data.pet_id]
  );
  const pet = pets[0];

  if (!pet) {
    throw httpError(404, 'Mascota no encontrada.');
  }

  if (pet.status !== 'disponible') {
    throw httpError(400, 'La mascota no esta disponible para adopcion.');
  }

  const duplicates = await query(
    `SELECT id FROM adoption_requests
     WHERE user_id = ? AND pet_id = ? AND status IN (?, ?)
     LIMIT 1`,
    [data.user_id, data.pet_id, ...activeStatuses]
  );

  if (duplicates[0]) {
    throw httpError(409, 'Ya tienes una solicitud activa para esta mascota.');
  }

  const result = await query(
    `INSERT INTO adoption_requests (
      user_id, pet_id, motivation, home_suitable, special_care_experience, message
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.user_id,
      data.pet_id,
      data.motivation,
      Boolean(data.home_suitable),
      Boolean(data.special_care_experience),
      data.message || null
    ]
  );

  return findById(result.insertId);
};

const listByUser = async (userId, status = null) => {
  const values = [userId];
  let where = 'a.user_id = ?';

  if (status) {
    where += ' AND a.status = ?';
    values.push(status);
  }

  return query(`${adoptionSelect} WHERE ${where} ORDER BY a.created_at DESC`, values);
};

const listAll = async () => {
  return query(`${adoptionSelect} ORDER BY a.created_at DESC`);
};

const findById = async (id) => {
  const rows = await query(`${adoptionSelect} WHERE a.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
};

const transitions = {
  pendiente: ['en_proceso', 'rechazada', 'cancelada'],
  en_proceso: ['aprobada', 'rechazada', 'cancelada'],
  aprobada: [],
  rechazada: [],
  cancelada: []
};

const updateStatus = async (id, nextStatus) => {
  await transaction(async (connection) => {
    const [rows] = await connection.execute(
      'SELECT id, pet_id, status FROM adoption_requests WHERE id = ? LIMIT 1',
      [id]
    );
    const request = rows[0];

    if (!request) {
      throw httpError(404, 'Solicitud de adopcion no encontrada.');
    }

    if (!transitions[request.status].includes(nextStatus)) {
      throw httpError(400, `No se puede cambiar de ${request.status} a ${nextStatus}.`);
    }

    await connection.execute(
      'UPDATE adoption_requests SET status = ? WHERE id = ?',
      [nextStatus, id]
    );

    if (nextStatus === 'en_proceso') {
      await connection.execute(
        "UPDATE pets SET status = 'en_proceso' WHERE id = ?",
        [request.pet_id]
      );
    }

    if (nextStatus === 'aprobada') {
      await connection.execute(
        "UPDATE pets SET status = 'adoptada' WHERE id = ?",
        [request.pet_id]
      );
      await connection.execute(
        `UPDATE adoption_requests
         SET status = 'rechazada'
         WHERE pet_id = ? AND id <> ? AND status IN ('pendiente', 'en_proceso')`,
        [request.pet_id, id]
      );
    }

    return id;
  });

  return findById(id);
};

module.exports = {
  create,
  listByUser,
  listAll,
  findById,
  updateStatus
};
