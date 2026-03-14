const jwt = require('jsonwebtoken');

exports.generateTokens = (data) => {
	const accessToken = jwt.sign(data, process.env.TOKEN_KEY_ACCESS, {
		expiresIn: '2h',
	});
	const refreshToken = jwt.sign(
		{ id: data._id },
		process.env.TOKEN_KEY_REFRESH,
		{
			expiresIn: '7d',
		},
	);

	return {
		accessToken,
		refreshToken,
	};
};

exports.verifyToken = (token) => {
	return jwt.verify(token, process.env.JWT_KEY);
};
