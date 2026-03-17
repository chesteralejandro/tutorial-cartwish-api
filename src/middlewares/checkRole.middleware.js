const { STATUS_CODES } = require('../config/constants');

const checkRole = (role) => {
	return (req, res, next) => {
		if (!req.user || req.user.role !== role) {
			console.log(req.user.role);
			res.status(STATUS_CODES.FORBIDDEN).json({
				message: `Access denied: ${role} only!`,
			});

			return;
		}

		next();
	};
};

module.exports = checkRole;
