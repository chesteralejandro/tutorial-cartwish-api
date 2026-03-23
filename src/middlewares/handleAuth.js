const jwt = require('../utils/jwt');

const { STATUS_CODES } = require('../config/constants');

const handleAuth = (req, res, next) => {
	const headerAuthorization = req.headers.authorization;

	if (!headerAuthorization || !headerAuthorization.startsWith('Bearer ')) {
		res.status(STATUS_CODES.UNAUTHORIZED).json({
			message: 'Authorization token required!',
		});

		return;
	}

	const [_bearer, accessToken] = headerAuthorization.split(' ');
	const validatedAccessToken = jwt.validateAccessToken(accessToken);

	if (!validatedAccessToken) {
		res.status(STATUS_CODES.BAD_REQUEST).json({
			message: 'Invalid Token!',
		});

		return;
	}

	req.user = validatedAccessToken;
	next();
};

module.exports = handleAuth;
