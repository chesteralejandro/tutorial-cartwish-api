const router = require('express').Router();
const passport = require('passport');

const User = require('../user/user.model');
const { generateTokens, verifyToken } = require('../../utils/jwt.js');
const {
	createHashedValue,
	validatePassword,
} = require('../../utils/bcrypt.js');
const { STATUS_CODES } = require('../../config/constants.js');

// Dummy login page url for a React app.
const FRONTEND_URL = 'http://localhost:5173/login';

router.get(
	'/google',
	passport.authenticate('google', { scope: ['email', 'profile'] }),
);

router.get(
	'/google/callback',
	passport.authenticate('google', {
		session: false,
		failureRedirect: FRONTEND_URL,
	}),
	async (req, res) => {
		// Check user is available or not using googleId or email.
		const profile = req.user;

		const { accessToken, refreshToken } = await handleOAuthCallback(
			profile,
			'googleId',
		);

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'none',
			// domain: 'api.backend.com',
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});

		res.redirect(`http://localhost:5173/dashboard?token=${accessToken}`);
	},
);

router.get(
	'/facebook',
	passport.authenticate('facebook', { scope: ['public_profile', 'email'] }),
);

router.get(
	'/facebook/callback',
	passport.authenticate('facebook', {
		session: false,
		failureRedirect: FRONTEND_URL,
	}),
	async (req, res) => {
		// Check user is available or not using googleId or email.
		const profile = req.user;

		const { accessToken, refreshToken } = await handleOAuthCallback(
			profile,
			'facebookId',
		);

		res.redirect(`http://localhost:5173/dashboard?token=${accessToken}`);
	},
);

router.post('/refresh', async (req, res) => {
	const userRefreshToken = req.cookies.refreshToken;

	if (!userRefreshToken) {
		res.status(STATUS_CODES.UNAUTHORIZED).json({
			message: 'No refresh token provided',
		});

		return;
	}

	let decodedUser;
	try {
		decodedUser = verifyToken(userRefreshToken);
	} catch (error) {
		res.status(STATUS_CODES.FORBIDDEN).json({
			message: 'Invalid Refresh Token',
		});

		return;
	}

	const user = await User.findById(decodedUser._id);

	if (!user) {
		res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
		return;
	}

	const isValidRefreshToken = await validatePassword(
		userRefreshToken,
		user.refreshToken,
	);

	if (!isValidRefreshToken) {
		res.status(STATUS_CODES.FORBIDDEN).json({
			message: 'Refresh token is not valid',
		});
	}

	const { accessToken, refreshToken } = generateTokens({
		_id: user._id,
		name: user.name,
	});

	const hashedRefreshToken = await createHashedValue(refreshToken);
	user.refreshToken = hashedRefreshToken;

	await user.save();

	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'none',
		maxAge: 1000 * 60 * 60 * 24 * 7,
	});

	res.status(STATUS_CODES.OK).json(accessToken);
});

router.post('/logout', async (req, res) => {
	const userRefreshToken = req.cookies.refreshToken;

	if (!userRefreshToken) {
		res.status(STATUS_CODES.UNAUTHORIZED).json({
			message: 'No refresh token provided',
		});

		return;
	}

	let decodedUser;
	try {
		decodedUser = verifyToken(userRefreshToken);
	} catch (error) {
		res.status(STATUS_CODES.FORBIDDEN).json({
			message: 'Invalid Refresh Token',
		});

		return;
	}

	const user = await User.findById(decodedUser._id);

	if (!user) {
		res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
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

	res.status(STATUS_CODES.OK).json({ message: 'Logged out successfully' });
});

async function handleOAuthCallback(profile, providerId) {
	let userFound = await User.findOne({
		$or: [{ [providerId]: profile.id }, { email: profile.emails[0].value }],
	});

	if (userFound) {
		// (User available) Update google ID. Generate token and send in response.
		if (!userFound[providerId]) {
			userFound[providerId] = profile.id;
			await userFound.save();
		}
	} else {
		// (User not available) Create new user. Generate token and send in response.
		userFound = new User({
			name: profile.displayName,
			email: profile.emails[0].value,
			[providerId]: profile.id,
		});

		await userFound.save();
	}

	const { accessToken, refreshToken } = generateTokens({
		_id: userFound._id,
		name: userFound.name,
	});

	const hashedRefreshToken = await createHashedValue(refreshToken);
	userFound.refreshToken = hashedRefreshToken;
	await userFound.save();

	return { accessToken, refreshToken };
}

module.exports = router;
