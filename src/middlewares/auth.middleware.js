const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const httpError = require('../utils/httpError');

const authMiddleware = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      throw httpError(401, 'Token no enviado.');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'matchcota_dev_secret');
    const user = await userModel.findById(payload.id);

    if (!user || user.status !== 'activo') {
      throw httpError(401, 'Token invalido o usuario inactivo.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : httpError(401, 'Token invalido o expirado.'));
  }
};

module.exports = authMiddleware;
