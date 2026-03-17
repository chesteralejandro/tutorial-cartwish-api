const router = require('express').Router();
const multer = require('multer');

const authMiddleware = require('../../middlewares/auth.middleware');
const checkRole = require('../../middlewares/checkRole.middleware');

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
	(req, res) => {
		res.send('Seller is here');
	},
);

module.exports = router;
