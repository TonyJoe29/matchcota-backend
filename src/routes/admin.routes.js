const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const requireRoles = require('../middlewares/role.middleware');

router.use(authMiddleware, requireRoles('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/status', adminController.updateUserStatus);

module.exports = router;
