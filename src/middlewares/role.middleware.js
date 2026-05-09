const httpError = require('../utils/httpError');

const requireRoles = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(httpError(401, 'Debes iniciar sesion.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(httpError(403, 'No tienes permisos para realizar esta accion.'));
    }

    next();
  };
};

module.exports = requireRoles;
