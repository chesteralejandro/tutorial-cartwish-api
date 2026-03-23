const router = require('express').Router();

const categoryController = require('./category.controller');

const handleRole = require('../../middlewares/handleRole');
const authMiddleware = require('../../middlewares/auth.middleware');
const handleUpload = require('../../middlewares/upload.middleware');

router.get('/', categoryController.getCategories);

router.post(
	'/',
	authMiddleware,
	handleRole('admin'),
	handleUpload('single', 'icon', 'categories'),
	categoryController.create,
);

module.exports = router;
