PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  birth_date TEXT NULL,
  location TEXT NULL,
  profile_photo_url TEXT NULL,
  occupation TEXT NULL,
  housing_type TEXT NULL,
  available_space_type TEXT NULL,
  available_space_m2 INTEGER NULL,
  daily_available_hours INTEGER NULL,
  monthly_income_mxn REAL NULL,
  pet_experience TEXT NULL,
  current_pets TEXT NULL,
  has_children_under_12 INTEGER NOT NULL DEFAULT 0,
  role_id INTEGER NOT NULL DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'suspendido', 'eliminado')),
  deleted_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS species (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS breeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  species_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  UNIQUE (species_id, name),
  FOREIGN KEY (species_id) REFERENCES species(id)
);

CREATE TABLE IF NOT EXISTS sizes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  state TEXT NULL
);

CREATE TABLE IF NOT EXISTS pets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  species_id INTEGER NOT NULL,
  breed_id INTEGER NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('macho', 'hembra')),
  size_id INTEGER NOT NULL,
  city_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'en_proceso', 'adoptada', 'inactiva')),
  photo_url TEXT NULL,
  health_status TEXT NULL,
  special_needs TEXT NULL,
  is_sterilized INTEGER NOT NULL DEFAULT 0,
  is_vaccinated INTEGER NOT NULL DEFAULT 0,
  compatible_dogs INTEGER NOT NULL DEFAULT 1,
  compatible_cats INTEGER NOT NULL DEFAULT 1,
  compatible_children INTEGER NOT NULL DEFAULT 1,
  description TEXT NULL,
  deleted_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (species_id) REFERENCES species(id),
  FOREIGN KEY (breed_id) REFERENCES breeds(id),
  FOREIGN KEY (size_id) REFERENCES sizes(id),
  FOREIGN KEY (city_id) REFERENCES cities(id)
);

CREATE TABLE IF NOT EXISTS adoption_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  pet_id INTEGER NOT NULL,
  motivation TEXT NOT NULL,
  home_suitable INTEGER NOT NULL DEFAULT 0,
  special_care_experience INTEGER NOT NULL DEFAULT 0,
  message TEXT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_proceso', 'aprobada', 'rechazada', 'cancelada')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (pet_id) REFERENCES pets(id)
);

CREATE INDEX IF NOT EXISTS idx_adoptions_user_pet_status
  ON adoption_requests (user_id, pet_id, status);

CREATE TABLE IF NOT EXISTS alert_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1,
  species_ids TEXT NULL,
  breed_ids TEXT NULL,
  city_ids TEXT NULL,
  min_age INTEGER NULL,
  max_age INTEGER NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS support_incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('error', 'queja', 'sugerencia')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  related_type TEXT NULL,
  related_id TEXT NULL,
  status TEXT NOT NULL DEFAULT 'abierta' CHECK (status IN ('abierta', 'en_revision', 'resuelta', 'cerrada')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TEXT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
