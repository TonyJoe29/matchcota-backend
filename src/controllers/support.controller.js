const incidentModel = require('../models/incident.model');

const createIncident = async (req, res, next) => {
  try {
    const related = req.body.related_entity || req.body.entidad_relacionada || {};
    const incident = await incidentModel.create({
      user_id: req.user.id,
      type: req.body.type || req.body.tipo,
      subject: req.body.subject || req.body.asunto,
      description: req.body.description || req.body.descripcion,
      related_type: req.body.related_type || related.type || related.tipo,
      related_id: req.body.related_id || related.id
    });

    res.status(201).json({
      message: 'Incidencia reportada correctamente.',
      incident
    });
  } catch (error) {
    next(error);
  }
};

const listIncidents = async (_req, res, next) => {
  try {
    const incidents = await incidentModel.list();
    res.json({ data: incidents });
  } catch (error) {
    next(error);
  }
};

const updateIncidentStatus = async (req, res, next) => {
  try {
    const incident = await incidentModel.updateStatus(req.params.id, req.body.status || req.body.estatus);
    res.json({
      message: 'Incidencia actualizada correctamente.',
      incident
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIncident,
  listIncidents,
  updateIncidentStatus
};
