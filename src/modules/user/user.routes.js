const router = require('express').Router();

const userController = require('./user.controller.js');

router.post('/', userController.create);

module.exports = router;
