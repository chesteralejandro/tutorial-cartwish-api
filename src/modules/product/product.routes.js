const router = require('express').Router();

const productController = require('./product.controller');

const handleAuth = require('../../middlewares/handleAuth');
const handleRole = require('../../middlewares/handleRole');
const handleUpload = require('../../middlewares/upload.middleware');

router.post(
	'/',
	handleAuth,
	handleRole('seller'),
	handleUpload('array', 'images', 'products'),
	productController.create,
);

router.get('/', productController.getAll);

router.get('/:productId', productController.getOne);

router.delete('/:productId', handleAuth, productController.delete);

module.exports = router;
