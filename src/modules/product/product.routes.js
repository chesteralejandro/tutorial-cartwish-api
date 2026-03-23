const router = require('express').Router();

const productController = require('./product.controller');

const authMiddleware = require('../../middlewares/auth.middleware');
const checkRole = require('../../middlewares/checkRole.middleware');
const handleUpload = require('../../middlewares/upload.middleware');

router.post(
	'/',
	authMiddleware,
	checkRole('seller'),
	handleUpload('array', 'images', 'products'),
	productController.create,
);

router.get('/', productController.getAll);

router.get('/:productId', productController.getOne);

router.delete('/:productId', authMiddleware, productController.delete);

module.exports = router;
