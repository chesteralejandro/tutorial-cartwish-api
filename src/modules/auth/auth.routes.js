const router = require('express').Router();
const passport = require('passport');

const authController = require('./auth.controller.js');

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
	authController.runGoogleCallback,
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
	authController.runFacebookCallback,
);

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
