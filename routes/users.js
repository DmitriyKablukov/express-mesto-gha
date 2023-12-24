const router = require('express').Router();
const userController = require('../controllers/users');

router.patch('/me', userController.updateProfile);
router.patch('/me/avatar', userController.updateAvatar);
router.get('/', userController.getUsers);
router.get('/me', userController.getMe);
router.get('/:userId', userController.getUser);

module.exports = router;
