const router = require('express').Router();

const userController = require('./user.controller.js');

const handleAuth = require('../../middleware/handleAuth.js');

router.get('/', handleAuth, userController.showDashboard);

router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;
