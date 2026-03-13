const router = require('express').Router();
const authMiddleware = require('../../middlewares/auth.middleware.js');

const userController = require('./user.controller.js');

router.get('/', authMiddleware, userController.showDashboard);

router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;
