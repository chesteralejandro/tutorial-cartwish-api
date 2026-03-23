const router = require('express').Router();
const handleAuth = require('../../middlewares/handleAuth.js');

const userController = require('./user.controller.js');

router.get('/', handleAuth, userController.showDashboard);

router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;
