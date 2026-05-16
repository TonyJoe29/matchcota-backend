INSERT OR IGNORE INTO roles (id, name) VALUES
  (1, 'admin'),
  (2, 'soporte'),
  (3, 'usuario');

INSERT OR IGNORE INTO species (id, name) VALUES
  (1, 'Perro'),
  (2, 'Gato'),
  (3, 'Otro');

INSERT OR IGNORE INTO breeds (id, species_id, name) VALUES
  (1, 1, 'Schnauzer'),
  (2, 1, 'Golden Retriever'),
  (3, 1, 'Mestizo'),
  (4, 2, 'Cálico'),
  (5, 2, 'Mestizo');

INSERT OR IGNORE INTO sizes (id, name) VALUES
  (1, 'Pequeño'),
  (2, 'Mediano'),
  (3, 'Grande');

INSERT OR IGNORE INTO cities (id, name, state) VALUES
  (1, 'Guadalajara', 'Jalisco'),
  (2, 'Zapopan', 'Jalisco'),
  (3, 'Guanajuato', 'Guanajuato'),
  (4, 'Monterrey', 'Nuevo León'),
  (5, 'Puebla', 'Puebla');

-- Password admin: Admin123!
INSERT OR IGNORE INTO users (
  id, username, email, password_hash, name, location, role_id
) VALUES (
  1,
  'admin',
  'admin@matchcota.test',
  '$2b$10$f7KWepImCBzPR1ktphU2KO7hUezmqZRiBbSQ8jNMX5GGaho19j93W',
  'Administrador Matchcota',
  'Guadalajara, Jalisco',
  1
);

-- Password usuario: Usuario123!
INSERT OR IGNORE INTO users (
  id, username, email, password_hash, name, location, role_id
) VALUES (
  2,
  'adi_06',
  'adis06@gmail.com',
  '$2b$10$okkSAspSZzp0jz112V24m.Ut.zMNDrfqqSvFGaugMrRcPbkzkuO2G',
  'Adilene Fabiola Nava Díaz',
  'Guadalajara, Jalisco',
  3
);

INSERT OR IGNORE INTO pets (
  id, owner_id, name, species_id, breed_id, age, gender, size_id, city_id,
  photo_url, health_status, special_needs, is_sterilized, is_vaccinated,
  compatible_dogs, compatible_cats, compatible_children, description
) VALUES (
  1, 2, 'Blacky', 1, 1, 10, 'hembra', 1, 2,
  'https://foto_blacky.example/blacky.jpg',
  'Tiene un problema de hígado',
  'Pasear dos veces al día y chequeos cada seis meses',
  1, 1, 0, 0, 0,
  'Color negro, juguetona, territorial y dormilona'
);
