const router = require('express').Router();

const userController = require('./user.controller.js');

router.post('/', userController.register);
router.post('/login', userController.login);

module.exports = router;
