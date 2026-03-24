const Joi = require('joi');

const User = require('./user.model');

const { STATUS_CODES } = require('../../config/constants');

const bcrypt = require('../../utils/bcrypt');
const jwt = require('../../utils/jwt');
const appError = require('../../utils/appError');

const createUserSchema = Joi.object({
	name: Joi.string().min(3).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	deliveryAddress: Joi.string().min(5).required(),
});

class UserController {
	async showDashboard(req, res) {
		const user = await User.findById(req.user._id).select('-password');

		res.json(user);
	}

	async login(req, res, next) {
		const { email, password } = req.body;

		const userFound = await User.findOne({ email });

		if (!userFound) {
			appError.create('Invalid Credentials', STATUS_CODES.UNAUTHORIZED);
		}

		const isPasswordValid = await bcrypt.validateFromHash(
			password,
			userFound.password,
		);

		if (!isPasswordValid) {
			appError.create('Invalid Credentials', STATUS_CODES.UNAUTHORIZED);
		}

		const { accessToken, refreshToken } = jwt.createTokens({
			_id: userFound._id,
			name: userFound.name,
			role: userFound.role,
		});

		const hashedRefreshToken = await bcrypt.createHashedValue(refreshToken);
		userFound.refreshToken = hashedRefreshToken;

		await userFound.save();

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'none',
			// domain: 'api.backend.com',
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});

		res.status(STATUS_CODES.OK).json(accessToken);
	}

	async register(req, res) {
		const userData = req.body;

		const userFound = await User.findOne({ email: userData.email });

		const joiValidation = createUserSchema.validate(req.body);

		if (joiValidation.error) {
			appError.create(
				joiValidation.error.details[0].message,
				STATUS_CODES.BAD_REQUEST,
			);
		}

		if (userFound) {
			appError.create('User Already Exist.', STATUS_CODES.BAD_REQUEST);
		}

		const hashedPassword = await bcrypt.createHashedValue(
			userData.password,
		);
		const newUser = new User({ ...userData, password: hashedPassword });

		await newUser.save();

		const { accessToken, refreshToken } = jwt.createTokens({
			_id: newUser._id,
			name: newUser.name,
			role: newUser.role,
		});

		const hashedRefreshToken = bcrypt.createHashedValue(refreshToken);

		newUser.refreshToken = hashedRefreshToken;

		await newUser.save();

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'none',
			// domain: 'api.backend.com',
			maxAge: 1000 * 60 * 60 * 24 * 7,
		});

		res.status(STATUS_CODES.CREATED).json(accessToken);
	}
}

module.exports = new UserController();
