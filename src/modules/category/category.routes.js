const router = require('express').Router();

const categoryController = require('./category.controller');

const checkRole = require('../../middlewares/checkRole.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const handleUpload = require('../../middlewares/upload.middleware');

router.get('/', categoryController.getCategories);

router.post(
	'/',
	authMiddleware,
	checkRole('admin'),
	handleUpload('single', 'icon', 'categories'),
	categoryController.create,
);

module.exports = router;
