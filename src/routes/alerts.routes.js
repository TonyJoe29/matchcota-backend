const router = require('express').Router();
const alertsController = require('../controllers/alerts.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { alertValidator } = require('../validators/alert.validator');

router.get('/me', authMiddleware, alertsController.getAlert);
router.put('/me', authMiddleware, alertValidator, validate, alertsController.upsertAlert);

module.exports = router;
