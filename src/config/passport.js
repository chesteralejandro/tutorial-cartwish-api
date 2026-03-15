const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

function strategyCallback(request, accessToken, refreshToken, profile, done) {
	return done(null, profile);
}

const googleStrategy = new GoogleStrategy(
	{
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL: 'http://localhost:3000/api/auth/google/callback',
		passReqToCallback: true,
	},
	strategyCallback,
);

const facebookStrategy = new FacebookStrategy(
	{
		clientID: process.env.FACEBOOK_APP_ID,
		clientSecret: process.env.FACEBOOK_APP_SECRET,
		callbackURL: 'http://localhost:3000/api/auth/facebook/callback',
		passReqToCallback: true,
		profileFields: [
			'id',
			'emails',
			'name',
			'displayName',
			'picture.type(large)',
		],
	},
	strategyCallback,
);

passport.use(googleStrategy);
passport.use(facebookStrategy);

module.exports = passport;
