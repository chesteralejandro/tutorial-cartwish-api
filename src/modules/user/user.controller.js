const Joi = require('joi');

const User = require('./user.model.js');
const { STATUS_CODES } = require('../../config/constants.js');
const {
	createHashedPassword,
	validatePassword,
} = require('../../utils/bcrypt.js');
const { generateToken } = require('../../utils/jwt.js');

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

	async login(req, res) {
		const { email, password } = req.body;
		try {
			const userFound = await User.findOne({ email });

			if (!userFound) {
				res.status(STATUS_CODES.UNAUTHORIZED).json({
					message: 'Invalid Credentials ',
				});

				return;
			}

			const isPasswordValid = await validatePassword(
				password,
				userFound.password,
			);

			if (!isPasswordValid) {
				res.status(STATUS_CODES.UNAUTHORIZED).json({
					message: 'Invalid Credentials ',
				});

				return;
			}

			const token = generateToken({
				_id: userFound._id,
				name: userFound.name,
			});

			res.status(STATUS_CODES.OK).json(token);
		} catch (error) {
			res.status(STATUS_CODES.BAD_REQUEST).json({
				message: error.message,
			});
		}
	}

	async register(req, res) {
		const userData = req.body;
		try {
			const userFound = await User.findOne({ email: userData.email });

			const joiValidation = createUserSchema.validate(req.body);

			if (joiValidation.error) {
				res.status(STATUS_CODES.BAD_REQUEST).json(
					joiValidation.error.details[0].message,
				);
				return;
			}

			if (userFound) {
				throw new Error('User already exist.');
			}

			const hashedPassword = await createHashedPassword(
				userData.password,
			);
			const newUser = new User({ ...userData, password: hashedPassword });
			const savedUser = await newUser.save();

			const token = jwt.sign(
				{ _id: savedUser._id, name: savedUser.name },
				process.env.JWT_KEY,
				{ expiresIn: '2h' },
			);

			res.status(STATUS_CODES.CREATED).json(token);
		} catch (error) {
			res.status(STATUS_CODES.BAD_REQUEST).json({
				message: error.message,
			});
		}
	}
}

module.exports = new UserController();
