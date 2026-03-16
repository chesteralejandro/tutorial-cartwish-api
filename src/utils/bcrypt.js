const bcrypt = require('bcrypt');

exports.createHashedValue = async (value) => {
	const SALT_ROUNDS = 10;

	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	const hashedValue = await bcrypt.hash(value, salt);

	return hashedValue;
};

exports.validateFromHash = async (providedValue, hashedValue) => {
	const isValueValid = await bcrypt.compare(providedValue, hashedValue);
	return isValueValid;
};
