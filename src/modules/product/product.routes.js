const fs = require('node:fs/promises');
const path = require('node:path');
const router = require('express').Router();
const multer = require('multer');

const authMiddleware = require('../../middlewares/auth.middleware');
const checkRole = require('../../middlewares/checkRole.middleware');
const { STATUS_CODES } = require('../../config/constants');
const Product = require('./product.model');
const Category = require('../category/category.model');

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
	const SINGLE_PAGE = 1;
	const ITEMS_PER_PAGE = 8;
	const INITIAL_RATING = 0;
	const ANTI_NAN_VALUE = 1;

	const page = parseInt(req.query.page) || SINGLE_PAGE;
	const perPage = parseInt(req.query.perPage) || ITEMS_PER_PAGE;
	const category = req.query.category;
	const search = req.query.search;

	const query = {};

	if (category) {
		const categoryFound = await Category.findOne({ name: category });

		if (!categoryFound) {
			res.status(STATUS_CODES.NOT_FOUND).json({
				message: 'Category not found!',
			});

			return;
		}

		query.category = categoryFound._id;
	}

	if (search) {
		query.title = { $regex: search, $options: 'i' };
	}

	const products = await Product.find(query)
		.select('-description -seller -category -__v')
		.skip((page - SINGLE_PAGE) * perPage)
		.limit(perPage)
		.lean(); // Returns clean object from mongoose without extra properties.

	const updatedProducts = products.map((product) => {
		const numberOfReviews = product.reviews.length;
		const sumOfRatings = product.reviews.reduce(
			(sum, review) => sum + review.rating,
			INITIAL_RATING,
		);
		const averageRating =
			sumOfRatings / (numberOfReviews || ANTI_NAN_VALUE);

		return {
			...product,
			images: product.images[0],
			reviews: { numberOfReviews, averageRating },
		};
	});

	const totalProducts = await Product.countDocuments(query);
	const totalPages = Math.ceil(totalProducts / perPage);

	res.status(STATUS_CODES.OK).json({
		updatedProducts,
		totalProducts,
		totalPages,
		currentPage: page,
		postPerPage: perPage,
	});
});

router.get('/:productId', async (req, res) => {
	const productId = req.params.productId;

	const productFound = await Product.findById(productId)
		.populate('seller', '_id name email')
		.populate('reviews.user', '_id name email')
		.select('-category -__v');

	if (!productFound) {
		res.status(STATUS_CODES.NOT_FOUND).json({
			message: 'Product not found!',
		});

		return;
	}

	res.status(STATUS_CODES.OK).json(productFound);
});

router.delete('/:productId', authMiddleware, async (req, res) => {
	const productId = req.params.productId;

	const productFound =
		await Product.findById(productId).select('seller images');

	if (!productFound) {
		res.status(STATUS_CODES.NOT_FOUND).json({
			message: 'Product not found!',
		});

		return;
	}

	if (
		req.user.role === 'admin' ||
		req.user._id.toString() === productFound.seller.toString()
	) {
		await productFound.deleteOne();

		if (productFound.images && Boolean(productFound.images.length)) {
			productFound.images.forEach(async (imageName) => {
				const fullPath = path.join(
					__dirname,
					'..',
					'..',
					'..',
					'upload',
					'products',
					imageName,
				);

				try {
					await fs.unlink(fullPath);
				} catch (error) {
					console.error(
						'Error deleting file:',
						fullPath,
						error.message,
					);
				}
			});
		}

		res.status(STATUS_CODES.OK).json({
			message: 'Product deleted successfully!',
		});

		return;
	}

	res.status(STATUS_CODES.FORBIDDEN).json({
		message: 'Access denied: Only admin or seller can delete this product!',
	});
});

module.exports = router;
