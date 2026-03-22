const multer = require('multer');

const MAX_FILES_NUMBER = 8;

const handleUpload = (
	methodName = 'single',
	fieldName = 'icon',
	folderName = 'categories',
) => {
	const storage = multer.diskStorage({
		destination: (_req, _file, callback) => {
			callback(null, `upload/${folderName}`);
		},
		filename: (_req, file, callback) => {
			const timeStamp = Date.now();
			const originalName = file.originalname
				.replace(/\s+/g, '-')
				.replace(/[^a-zA-Z0-9.-]/g, '');

			callback(null, `${timeStamp}-${originalName}`);
		},
	});

	const fileFilter = (_req, file, callback) => {
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

		if (allowedTypes.includes(file.mimetype)) {
			callback(null, true);
		} else {
			callback(
				new Error(
					'Invalid file type. Only JPEG, PNG and GIF are allowed',
				),
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

	switch (methodName.toLowerCase()) {
		case 'single':
			return upload.single(fieldName);
		case 'array':
			return upload.array(fieldName, MAX_FILES_NUMBER);
		default:
			return upload.single(fieldName);
	}
};

module.exports = handleUpload;
