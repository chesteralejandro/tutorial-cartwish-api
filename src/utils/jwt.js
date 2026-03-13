const jwt = require('jsonwebtoken');

exports.generateToken = (data) => {
	const config = {
		expiresIn: '2h',
	};

	return jwt.sign(data, process.env.JWT_KEY, config);
};

exports.verifyToken = (token) => {
	return jwt.verify(token, process.env.JWT_KEY);
};
