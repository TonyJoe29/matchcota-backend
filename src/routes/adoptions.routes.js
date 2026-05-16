const router = require('express').Router();
const adoptionsController = require('../controllers/adoptions.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const requireRoles = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createAdoptionValidator,
  updateStatusValidator
} = require('../validators/adoption.validator');

router.post('/', authMiddleware, createAdoptionValidator, validate, adoptionsController.createAdoption);
router.get('/my-requests', authMiddleware, adoptionsController.myRequests);
router.get('/received', authMiddleware, adoptionsController.receivedRequests);
router.get('/', authMiddleware, requireRoles('admin'), adoptionsController.listRequests);
router.get('/:id', authMiddleware, adoptionsController.getRequest);
router.patch(
  '/:id/status',
  authMiddleware,
  requireRoles('admin'),
  updateStatusValidator,
  validate,
  adoptionsController.updateStatus
);

module.exports = router;
