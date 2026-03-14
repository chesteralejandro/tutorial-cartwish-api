const bcrypt = require('bcrypt');

exports.createHashedValue = async (value) => {
	const SALT_ROUNDS = 10;

	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	const hashedValue = await bcrypt.hash(value, salt);

	return hashedValue;
};

exports.validatePassword = async (providedPassword, userPassword) => {
	return await bcrypt.compare(providedPassword, userPassword);
};
