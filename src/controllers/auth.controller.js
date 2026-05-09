const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
const generateToken = require('../utils/generateToken');
const httpError = require('../utils/httpError');

const register = async (req, res, next) => {
  try {
    const existingEmail = await userModel.findByEmail(req.body.email);
    const existingUsername = await userModel.findByUsername(req.body.username);

    if (existingEmail || existingUsername) {
      throw httpError(409, 'Username o email ya registrado.');
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await userModel.create({
      username: req.body.username,
      email: req.body.email,
      passwordHash,
      name: req.body.name || req.body.nombre,
      birth_date: req.body.birth_date || req.body.fecha_nacimiento,
      location: req.body.location || req.body.ubicacion
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      user,
      token: generateToken(user)
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await userModel.findByEmail(req.body.email);

    if (!user) {
      throw httpError(401, 'Credenciales invalidas.');
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password_hash);

    if (!validPassword) {
      throw httpError(401, 'Credenciales invalidas.');
    }

    if (user.status !== 'activo') {
      throw httpError(403, 'Usuario suspendido o inactivo.');
    }

    const safeUser = await userModel.findById(user.id);

    res.json({
      message: 'Inicio de sesion exitoso.',
      token: generateToken(safeUser),
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = {
  register,
  login,
  me
};
