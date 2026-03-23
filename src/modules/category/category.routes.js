const router = require('express').Router();

const categoryController = require('./category.controller');

const handleRole = require('../../middleware/handleRole');
const handleAuth = require('../../middleware/handleAuth');
const handleUpload = require('../../middleware/handleUpload');

router.get('/', categoryController.getCategories);

router.post(
	'/',
	handleAuth,
	handleRole('admin'),
	handleUpload('single', 'icon', 'categories'),
	categoryController.create,
);

module.exports = router;
