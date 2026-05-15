const { getDb } = require('../src/config/db');

const showTable = async (db, tableName) => {
  const rows = await db.all(`SELECT * FROM ${tableName} ORDER BY id`);
  console.log(`\n=== ${tableName} (${rows.length}) ===`);
  console.table(rows);
};

const main = async () => {
  const db = await getDb();

  await showTable(db, 'users');
  await showTable(db, 'pets');
  await showTable(db, 'adoption_requests');
  await showTable(db, 'support_incidents');
  await showTable(db, 'alert_preferences');

  await db.close();
};

main().catch((error) => {
  console.error('No se pudo leer la base:', error.message);
  process.exit(1);
});
