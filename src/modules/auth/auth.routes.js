const router = require('express').Router();
const passport = require('passport');

const User = require('../user/user.model');
const { generateToken } = require('../../utils/jwt.js');

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

		const token = await handleOAuthCallback(profile, 'googleId');

		res.redirect(`http://localhost:5173/dashboard?token=${token}`);
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

		const token = await handleOAuthCallback(profile, 'facebookId');

		res.redirect(`http://localhost:5173/dashboard?token=${token}`);
	},
);

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

	const token = generateToken({
		_id: userFound._id,
		name: userFound.name,
	});

	return token;
}

module.exports = router;
