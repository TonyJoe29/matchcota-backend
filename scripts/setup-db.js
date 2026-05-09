const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const dotenv = require('dotenv');

dotenv.config();

const rootDir = path.join(__dirname, '..');
const dbFile = process.env.DB_FILE || path.join('database', 'matchcota.sqlite');
const dbPath = path.isAbsolute(dbFile) ? dbFile : path.join(rootDir, dbFile);
const reset = process.argv.includes('--reset');

const readSql = (fileName) => {
  return fs.readFileSync(path.join(rootDir, 'database', fileName), 'utf8');
};

const setup = async () => {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  if (reset && fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON;');
  await db.exec(readSql('schema.sql'));
  await db.exec(readSql('seed.sql'));
  await db.close();

  console.log(`Base SQLite lista: ${dbPath}`);
};

setup().catch((error) => {
  console.error('No se pudo preparar la base SQLite:', error.message);
  process.exit(1);
});
