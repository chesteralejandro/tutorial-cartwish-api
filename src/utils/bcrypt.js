const bcrypt = require('bcrypt');

exports.createHashedPassword = async (password) => {
	const SALT_ROUNDS = 10;

	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	const hashedPassword = await bcrypt.hash(password, salt);

	return hashedPassword;
};
