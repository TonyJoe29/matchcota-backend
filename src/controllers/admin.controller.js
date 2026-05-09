const adminModel = require('../models/admin.model');
const userModel = require('../models/user.model');
const httpError = require('../utils/httpError');

const getStats = async (_req, res, next) => {
  try {
    const stats = await adminModel.stats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

const listUsers = async (_req, res, next) => {
  try {
    const users = await userModel.list();
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const user = await userModel.updateRole(req.params.id, req.body.role || req.body.rol);

    if (!user) {
      throw httpError(404, 'Usuario o rol no encontrado.');
    }

    res.json({
      message: 'Rol actualizado correctamente.',
      user
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await userModel.updateStatus(req.params.id, req.body.status || req.body.estatus);

    if (!user) {
      throw httpError(404, 'Usuario no encontrado.');
    }

    res.json({
      message: 'Estatus de usuario actualizado correctamente.',
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  listUsers,
  updateUserRole,
  updateUserStatus
};
