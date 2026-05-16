const router = require('express').Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', chatController.listConversations);
router.post('/support', chatController.openSupportChat);
router.post('/adoptions/:requestId', chatController.openAdoptionChat);
router.get('/:id/messages', chatController.listMessages);
router.post('/:id/messages', chatController.sendMessage);

module.exports = router;
