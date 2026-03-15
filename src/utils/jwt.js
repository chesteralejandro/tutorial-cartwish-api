const jwt = require('jsonwebtoken');

exports.createTokens = (data) => {
	const accessToken = jwt.sign({ ...data }, process.env.TOKEN_KEY_ACCESS, {
		expiresIn: '2h',
	});

	const refreshToken = jwt.sign(
		{ _id: data._id },
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

exports.validateAccessToken = (accessToken) => {
	try {
		const validatedAccessToken = jwt.verify(
			accessToken,
			process.env.TOKEN_KEY_ACCESS,
		);

		return validatedAccessToken;
	} catch (error) {
		return null;
	}
};

exports.validateRefreshToken = (refreshToken) => {
	try {
		const validatedRefreshToken = jwt.verify(
			refreshToken,
			process.env.TOKEN_KEY_REFRESH,
		);

		return validatedRefreshToken;
	} catch (error) {
		return null;
	}
};
