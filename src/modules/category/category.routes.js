const router = require('express').Router();
const multer = require('multer');

const { STATUS_CODES } = require('../../config/constants');
const Category = require('./category.model');
const checkRole = require('../../middlewares/checkRole.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, 'upload/categories');
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

router.get('/', async (req, res) => {
	const categories = await Category.find().sort('name');
	res.status(STATUS_CODES.OK).json(categories);
});

router.post(
	'/',
	authMiddleware,
	checkRole('admin'),
	upload.single('icon'),
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
