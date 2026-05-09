const router = require('express').Router();
const usersController = require('../controllers/users.controller');
const alertsController = require('../controllers/alerts.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { updateProfileValidator } = require('../validators/user.validator');
const { alertValidator } = require('../validators/alert.validator');

router.get('/profile', authMiddleware, usersController.getProfile);
router.put('/profile', authMiddleware, updateProfileValidator, validate, usersController.updateProfile);
router.get('/alerts', authMiddleware, alertsController.getAlert);
router.put('/alerts', authMiddleware, alertValidator, validate, alertsController.upsertAlert);

module.exports = router;
