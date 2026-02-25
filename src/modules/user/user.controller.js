const User = require('./user.model.js');
const STATUS_CODES = require('../../constants/statusCodes.js');

class UserController {
	async create(req, res) {
		const userData = req.body;
		try {
			const userFound = await User.findOne({ email: userData.email });

			if (userFound) {
				throw new Error('User already exist.');
			}

			const newUser = new User(userData);
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
