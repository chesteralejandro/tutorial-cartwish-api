const Joi = require('joi');

const User = require('./user.model.js');
const STATUS_CODES = require('../../constants/statusCodes.js');
const { createHashedPassword } = require('../../utils/bcrypt.js');

const createUserSchema = Joi.object({
	name: Joi.string().min(3).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	deliveryAddress: Joi.string().min(5).required(),
});

class UserController {
	async create(req, res) {
		const userData = req.body;
		try {
			const userFound = await User.findOne({ email: userData.email });

			const joiValidation = createUserSchema.validate(req.body);

			if (joiValidation.error) {
				res.status(400).json(joiValidation.error.details[0].message);
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

			res.status(STATUS_CODES.CREATED).json(savedUser);
		} catch (error) {
			res.status(STATUS_CODES.BAD_REQUEST).json({
				message: error.message,
			});
		}
	}
}

module.exports = new UserController();
