const { query } = require('../config/db');

const stats = async () => {
  const [users] = await query(`
    SELECT
      COUNT(*) AS total,
      SUM(status = 'activo') AS activos,
      SUM(status = 'suspendido') AS suspendidos
    FROM users
    WHERE deleted_at IS NULL
  `);
  const [pets] = await query(`
    SELECT
      COUNT(*) AS total_registradas,
      SUM(status = 'disponible') AS disponibles,
      SUM(status = 'adoptada') AS adoptadas
    FROM pets
    WHERE deleted_at IS NULL
  `);
  const [adoptions] = await query(`
    SELECT
      COUNT(*) AS total_solicitudes,
      SUM(status = 'pendiente') AS pendientes,
      SUM(status = 'en_proceso') AS en_proceso,
      SUM(status = 'aprobada') AS aprobadas,
      SUM(status = 'rechazada') AS rechazadas
    FROM adoption_requests
  `);
  const [support] = await query(`
    SELECT
      SUM(status IN ('abierta', 'en_revision')) AS incidencias_abiertas,
      SUM(status IN ('resuelta', 'cerrada')) AS incidencias_resueltas
    FROM support_incidents
  `);

  return {
    users,
    pets,
    adoptions,
    support,
    generated_at: new Date().toISOString()
  };
};

module.exports = {
  stats
};
