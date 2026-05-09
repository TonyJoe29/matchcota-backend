CREATE DATABASE IF NOT EXISTS matchcota_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE matchcota_db;

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  birth_date DATE NULL,
  location VARCHAR(120) NULL,
  profile_photo_url VARCHAR(255) NULL,
  occupation VARCHAR(120) NULL,
  housing_type VARCHAR(80) NULL,
  available_space_type VARCHAR(80) NULL,
  available_space_m2 INT NULL,
  daily_available_hours INT NULL,
  monthly_income_mxn DECIMAL(10,2) NULL,
  pet_experience VARCHAR(160) NULL,
  current_pets VARCHAR(160) NULL,
  has_children_under_12 BOOLEAN NOT NULL DEFAULT FALSE,
  role_id INT NOT NULL DEFAULT 3,
  status ENUM('activo', 'suspendido', 'eliminado') NOT NULL DEFAULT 'activo',
  deleted_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_roles FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS species (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS breeds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  species_id INT NOT NULL,
  name VARCHAR(80) NOT NULL,
  UNIQUE KEY uk_breeds_species_name (species_id, name),
  CONSTRAINT fk_breeds_species FOREIGN KEY (species_id) REFERENCES species(id)
);

CREATE TABLE IF NOT EXISTS sizes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(90) NOT NULL UNIQUE,
  state VARCHAR(90) NULL
);

CREATE TABLE IF NOT EXISTS pets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  name VARCHAR(80) NOT NULL,
  species_id INT NOT NULL,
  breed_id INT NULL,
  age INT NOT NULL,
  gender ENUM('macho', 'hembra') NOT NULL,
  size_id INT NOT NULL,
  city_id INT NOT NULL,
  status ENUM('disponible', 'en_proceso', 'adoptada', 'inactiva') NOT NULL DEFAULT 'disponible',
  photo_url VARCHAR(255) NULL,
  health_status TEXT NULL,
  special_needs TEXT NULL,
  is_sterilized BOOLEAN NOT NULL DEFAULT FALSE,
  is_vaccinated BOOLEAN NOT NULL DEFAULT FALSE,
  compatible_dogs BOOLEAN NOT NULL DEFAULT TRUE,
  compatible_cats BOOLEAN NOT NULL DEFAULT TRUE,
  compatible_children BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT NULL,
  deleted_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id) REFERENCES users(id),
  CONSTRAINT fk_pets_species FOREIGN KEY (species_id) REFERENCES species(id),
  CONSTRAINT fk_pets_breed FOREIGN KEY (breed_id) REFERENCES breeds(id),
  CONSTRAINT fk_pets_size FOREIGN KEY (size_id) REFERENCES sizes(id),
  CONSTRAINT fk_pets_city FOREIGN KEY (city_id) REFERENCES cities(id)
);

CREATE TABLE IF NOT EXISTS adoption_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pet_id INT NOT NULL,
  motivation TEXT NOT NULL,
  home_suitable BOOLEAN NOT NULL DEFAULT FALSE,
  special_care_experience BOOLEAN NOT NULL DEFAULT FALSE,
  message TEXT NULL,
  status ENUM('pendiente', 'en_proceso', 'aprobada', 'rechazada', 'cancelada') NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_adoptions_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_adoptions_pet FOREIGN KEY (pet_id) REFERENCES pets(id),
  INDEX idx_adoptions_user_pet_status (user_id, pet_id, status)
);

CREATE TABLE IF NOT EXISTS alert_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  species_ids JSON NULL,
  breed_ids JSON NULL,
  city_ids JSON NULL,
  min_age INT NULL,
  max_age INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_alerts_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS support_incidents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('error', 'queja', 'sugerencia') NOT NULL,
  subject VARCHAR(140) NOT NULL,
  description TEXT NOT NULL,
  related_type VARCHAR(40) NULL,
  related_id VARCHAR(40) NULL,
  status ENUM('abierta', 'en_revision', 'resuelta', 'cerrada') NOT NULL DEFAULT 'abierta',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_incidents_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  read_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id)
);
