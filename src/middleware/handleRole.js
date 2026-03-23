const { STATUS_CODES } = require('../config/constants');

const handleRole = (role) => {
	return (req, res, next) => {
		if (!req.user || req.user.role !== role) {
			res.status(STATUS_CODES.FORBIDDEN).json({
				message: `Access denied: ${role} only!`,
			});

			return;
		}

		next();
	};
};

module.exports = handleRole;
