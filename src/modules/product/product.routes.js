const router = require('express').Router();
const multer = require('multer');

const authMiddleware = require('../../middlewares/auth.middleware');
const checkRole = require('../../middlewares/checkRole.middleware');
const { STATUS_CODES } = require('../../config/constants');
const Product = require('./product.model');

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, 'upload/products');
	},
	filename: (req, file, callback) => {
		const timeStamp = Date.now();
		const originalName = file.originalname
			.replace(/\s+/g, '-')
			.replace(/[^a-zA-Z0-9.-]/g, '');

		callback(null, `${timeStamp}-${originalName}`);
	},
});

const fileFilter = (req, file, callback) => {
	const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

	if (allowedTypes.includes(file.mimetype)) {
		callback(null, true);
	} else {
		callback(
			new Error('Invalid file type. Only JPEG, PNG and GIF are allowed'),
			false,
		);
	}
};

const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 2 * 1024 * 1024,
	},
});

const MAX_FILES_NUMBER = 8;

router.post(
	'/',
	authMiddleware,
	checkRole('seller'),
	upload.array('images', MAX_FILES_NUMBER),
	async (req, res) => {
		const { title, description, category, price, stock } = req.body;
		const images = req.files.map((image) => image.filename);

		if (images.length === 0) {
			res.status(STATUS_CODES.BAD_REQUEST).json({
				message: 'At least one image is required!',
			});

			return;
		}

		const newProduct = new Product({
			title,
			description,
			category,
			price,
			stock,
			images,
			seller: req.user._id,
		});

		await newProduct.save();

		res.status(STATUS_CODES.CREATED).json(newProduct);
	},
);

router.get('/', async (req, res) => {
	const INITIAL_RATING = 0;

	const products = await Product.find()
		.select('-description -seller -category -__v')
		.lean(); // Returns clean object from mongoose without extra properties.

	const updatedProducts = products.map((product) => {
		const numberOfReviews = product.reviews.length;
		const sumOfRatings = product.reviews.reduce(
			(sum, review) => sum + review.rating,
			INITIAL_RATING,
		);
		const averageRating = sumOfRatings / numberOfReviews;

		return {
			...product,
			images: product.images[0],
			reviews: { numberOfReviews, averageRating },
		};
	});

	res.status(STATUS_CODES.OK).json(updatedProducts);
});

module.exports = router;
