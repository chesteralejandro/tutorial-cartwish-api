exports.create = (message, statusCode) => {
	const newError = new Error(message);
	newError.statusCode = statusCode;

	throw newError;
};
