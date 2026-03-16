const router = require('express').Router();
const multer = require('multer');

const { STATUS_CODES } = require('../../config/constants');
const Category = require('./category.model');

const upload = multer({
	dest: 'upload/cetegory/',
});

router.post('/', upload.single('icon'), async (req, res) => {
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
});

module.exports = router;
