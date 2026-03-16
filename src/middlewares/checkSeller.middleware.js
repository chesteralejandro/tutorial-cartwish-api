const { STATUS_CODES } = require('../config/constants');

const checkSeller = (req, res, next) => {
	if (!req.user || !req.user.role !== 'seller') {
		res.status(STATUS_CODES.FORBIDDEN).json({
			message: 'Access denied: Sellers only!',
		});

		return;
	}

	next();
};

module.exports = checkSeller;
