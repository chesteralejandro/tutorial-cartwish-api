const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/jwt');

const { STATUS_CODES } = require('../config/constants');

const authMiddleware = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		res.status(STATUS_CODES.UNAUTHORIZED).json({
			message: 'Authorization token required!',
		});

		return;
	}

	try {
		const [_bearer, token] = authHeader.split(' ');
		const decodedUser = verifyToken(token);

		req.user = decodedUser;
		next();
	} catch (error) {
		res.status(STATUS_CODES.BAD_REQUEST).json({
			message: 'Invalid Token!',
		});
	}
};

module.exports = authMiddleware;
