const adoptionModel = require('../models/adoption.model');
const httpError = require('../utils/httpError');

const createAdoption = async (req, res, next) => {
  try {
    const request = await adoptionModel.create({
      user_id: req.user.id,
      pet_id: req.body.pet_id || req.body.id_mascota,
      motivation: req.body.motivation || req.body.motivacion,
      home_suitable: req.body.home_suitable ?? req.body.hogar_adecuado,
      special_care_experience:
        req.body.special_care_experience ?? req.body.experiencia_cuidados_especiales,
      message: req.body.message || req.body.mensaje
    });

    res.status(201).json({
      message: 'Solicitud de adopción creada exitosamente.',
      request
    });
  } catch (error) {
    next(error);
  }
};

const myRequests = async (req, res, next) => {
  try {
    const requests = await adoptionModel.listByUser(req.user.id, req.query.status || req.query.estatus);
    res.json({ data: requests });
  } catch (error) {
    next(error);
  }
};

const listRequests = async (_req, res, next) => {
  try {
    const requests = await adoptionModel.listAll();
    res.json({ data: requests });
  } catch (error) {
    next(error);
  }
};

const receivedRequests = async (req, res, next) => {
  try {
    const requests = await adoptionModel.listByPetOwner(req.user.id);
    res.json({ data: requests });
  } catch (error) {
    next(error);
  }
};

const getRequest = async (req, res, next) => {
  try {
    const request = await adoptionModel.findById(req.params.id);

    if (!request) {
      throw httpError(404, 'Solicitud no encontrada.');
    }

    if (request.user_id !== req.user.id && req.user.role !== 'admin') {
      throw httpError(403, 'No puedes consultar esta solicitud.');
    }

    res.json({ request });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const status = req.body.status || req.body.estatus;
    const request = await adoptionModel.updateStatus(req.params.id, status);

    res.json({
      message: 'Estatus de solicitud actualizado correctamente.',
      request
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAdoption,
  myRequests,
  listRequests,
  receivedRequests,
  getRequest,
  updateStatus
};
