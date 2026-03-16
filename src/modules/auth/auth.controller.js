const User = require('../user/user.model');
const jwt = require('../../utils/jwt.js');
const bcrypt = require('../../utils/bcrypt.js');
const { STATUS_CODES } = require('../../config/constants.js');

class Auth {
	setRefreshTokenCookie(res, refreshToken) {
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'none',
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});
	}

	async runGoogleCallback(req, res) {
		// Check user is available or not using googleId or email.
		const profile = req.user;

		const { accessToken, refreshToken } = await handleOAuthCallback(
			profile,
			'googleId',
		);

		this.setRefreshTokenCookie(res, refreshToken);

		res.redirect(`http://localhost:5173/dashboard?token=${accessToken}`);
	}

	async runFacebookCallback(req, res) {
		// Check user is available or not using googleId or email.
		const profile = req.user;

		const { accessToken, refreshToken } = await handleOAuthCallback(
			profile,
			'facebookId',
		);

		this.setRefreshTokenCookie(res, refreshToken);

		res.redirect(`http://localhost:5173/dashboard?token=${accessToken}`);
	}

	async refresh(req, res) {
		const userRefreshToken = req.cookies.refreshToken;

		if (!userRefreshToken) {
			res.status(STATUS_CODES.UNAUTHORIZED).json({
				message: 'No refresh token provided',
			});

			return;
		}

		const decodedUser = jwt.validateRefreshToken(userRefreshToken);

		if (!decodedUser) {
			res.status(STATUS_CODES.FORBIDDEN).json({
				message: 'Invalid Refresh Token',
			});

			return;
		}

		const user = await User.findById(decodedUser._id);

		if (!user) {
			res.status(STATUS_CODES.NOT_FOUND).json({
				message: 'User not found',
			});

			return;
		}

		const isValidRefreshToken = await bcrypt.validateFromHash(
			userRefreshToken,
			user.refreshToken,
		);

		if (!isValidRefreshToken) {
			res.status(STATUS_CODES.FORBIDDEN).json({
				message: 'Refresh token is not valid',
			});

			return;
		}

		const { accessToken, refreshToken } = jwt.createTokens({
			_id: user._id,
			name: user.name,
		});

		const hashedRefreshToken = await bcrypt.createHashedValue(refreshToken);
		user.refreshToken = hashedRefreshToken;

		await user.save();

		this.setRefreshTokenCookie(res, refreshToken);

		res.status(STATUS_CODES.OK).json(accessToken);
	}

	async logout(req, res) {
		const userRefreshToken = req.cookies.refreshToken;

		if (!userRefreshToken) {
			res.status(STATUS_CODES.UNAUTHORIZED).json({
				message: 'No refresh token provided',
			});

			return;
		}

		const decodedUser = jwt.validateRefreshToken(userRefreshToken);

		if (!decodedUser) {
			res.status(STATUS_CODES.FORBIDDEN).json({
				message: 'Invalid Refresh Token',
			});

			return;
		}

		const user = await User.findById(decodedUser._id);

		if (!user) {
			res.status(STATUS_CODES.NOT_FOUND).json({
				message: 'User not found',
			});

			return;
		}

		user.refreshToken = null;
		await user.save();

		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'none',
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});

		res.status(STATUS_CODES.OK).json({
			message: 'Logged out successfully',
		});
	}
}

async function handleOAuthCallback(profile, providerId) {
	let userFound = await User.findOne({
		$or: [{ [providerId]: profile.id }, { email: profile.emails[0].value }],
	});

	if (userFound) {
		// (User available) Update google/facebook ID.
		if (!userFound[providerId]) {
			userFound[providerId] = profile.id;
			await userFound.save();
		}
	} else {
		// (User not available) Create new user.
		userFound = new User({
			name: profile.displayName,
			email: profile.emails[0].value,
			[providerId]: profile.id,
		});

		await userFound.save();
	}

	// Generate token and send in response.
	const { accessToken, refreshToken } = jwt.createTokens({
		_id: userFound._id,
		name: userFound.name,
	});

	const hashedRefreshToken = await createHashedValue(refreshToken);
	userFound.refreshToken = hashedRefreshToken;
	await userFound.save();

	return { accessToken, refreshToken };
}

module.exports = new Auth();
