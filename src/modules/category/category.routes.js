const router = require('express').Router();

const categoryController = require('./category.controller');

const handleRole = require('../../middlewares/handleRole');
const handleAuth = require('../../middlewares/handleAuth');
const handleUpload = require('../../middlewares/upload.middleware');

router.get('/', categoryController.getCategories);

router.post(
	'/',
	handleAuth,
	handleRole('admin'),
	handleUpload('single', 'icon', 'categories'),
	categoryController.create,
);

module.exports = router;
