const router = require('express').Router();
const supportController = require('../controllers/support.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const requireRoles = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { incidentValidator } = require('../validators/incident.validator');

router.post('/incidents', authMiddleware, incidentValidator, validate, supportController.createIncident);
router.get('/incidents', authMiddleware, requireRoles('admin', 'soporte'), supportController.listIncidents);
router.patch(
  '/incidents/:id/status',
  authMiddleware,
  requireRoles('admin', 'soporte'),
  supportController.updateIncidentStatus
);

module.exports = router;
