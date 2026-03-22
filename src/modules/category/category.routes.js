const router = require('express').Router();

const { STATUS_CODES } = require('../../config/constants');
const Category = require('./category.model');
const checkRole = require('../../middlewares/checkRole.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const handleUpload = require('../../middlewares/upload.middleware');

router.get('/', async (req, res) => {
	const categories = await Category.find().sort('name');
	res.status(STATUS_CODES.OK).json(categories);
});

router.post(
	'/',
	authMiddleware,
	checkRole('admin'),
	handleUpload('single', 'icon', 'categories'),
	async (req, res) => {
		if (!req.body.name || !req.file) {
			res.status(STATUS_CODES.BAD_REQUEST).json({
				message: 'Name and icon are required',
			});

			return;
		}
		console.log(req.file);

		const newCategory = new Category({
			name: req.body.name,
			image: req.file.filename,
		});

		await newCategory.save();

		res.status(STATUS_CODES.CREATED).json({
			message: 'Category added successfully!',
		});
	},
);

module.exports = router;
