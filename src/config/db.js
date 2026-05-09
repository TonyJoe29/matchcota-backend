const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const dotenv = require('dotenv');

dotenv.config();

let dbPromise;

const getDbPath = () => {
  return process.env.DB_FILE || path.join(__dirname, '..', '..', 'database', 'matchcota.sqlite');
};

const getDb = async () => {
  if (!dbPromise) {
    dbPromise = open({
      filename: getDbPath(),
      driver: sqlite3.Database
    });

    const db = await dbPromise;
    await db.exec('PRAGMA foreign_keys = ON;');
  }

  return dbPromise;
};

const isSelectQuery = (sql) => {
  const normalized = sql.trim().toLowerCase();
  return normalized.startsWith('select') || normalized.startsWith('pragma');
};

const query = async (sql, params = []) => {
  const db = await getDb();

  if (isSelectQuery(sql)) {
    return db.all(sql, params);
  }

  const result = await db.run(sql, params);

  return {
    insertId: result.lastID,
    affectedRows: result.changes
  };
};

const transaction = async (callback) => {
  const db = await getDb();

  const connection = {
    execute: async (sql, params = []) => {
      if (isSelectQuery(sql)) {
        const rows = await db.all(sql, params);
        return [rows];
      }

      const result = await db.run(sql, params);
      return [{ insertId: result.lastID, affectedRows: result.changes }];
    }
  };

  try {
    await db.exec('BEGIN IMMEDIATE TRANSACTION;');
    const result = await callback(connection);
    await db.exec('COMMIT;');
    return result;
  } catch (error) {
    await db.exec('ROLLBACK;');
    throw error;
  }
};

module.exports = {
  getDb,
  query,
  transaction
};
