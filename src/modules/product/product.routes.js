const router = require('express').Router();

const productController = require('./product.controller');

const handleAuth = require('../../middleware/handleAuth');
const handleRole = require('../../middleware/handleRole');
const handleUpload = require('../../middleware/handleUpload');

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
