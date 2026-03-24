const fs = require('node:fs/promises');
const path = require('node:path');

const Product = require('./product.model');
const Category = require('../category/category.model');

const { STATUS_CODES } = require('../../config/constants');

const appError = require('../../utils/appError');

class ProductController {
	async create(req, res) {
		const { title, description, category, price, stock } = req.body;
		const images = req.files.map((image) => image.filename);

		if (images.length === 0) {
			appError.create(
				'At Least One Image Is Required!',
				STATUS_CODES.BAD_REQUEST,
			);
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
	}

	async getAll(req, res) {
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
				appError.create('Category Not Found!', STATUS_CODES.NOT_FOUND);
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
	}

	async getOne(req, res) {
		const productId = req.params.productId;

		const productFound = await Product.findById(productId)
			.populate('seller', '_id name email')
			.populate('reviews.user', '_id name email')
			.select('-category -__v');

		if (!productFound) {
			appError.create('Product Not Found!', STATUS_CODES.NOT_FOUND);
		}

		res.status(STATUS_CODES.OK).json(productFound);
	}

	async delete(req, res) {
		const productId = req.params.productId;

		const productFound =
			await Product.findById(productId).select('seller images');

		if (!productFound) {
			appError.create('Product Not Found!', STATUS_CODES.NOT_FOUND);
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

		appError.create(
			'Access Denied: Only Admin Or Seller Can Delete This Product!',
			STATUS_CODES.FORBIDDEN,
		);
	}
}

module.exports = new ProductController();
