const handleError = (error, _req, res, _next) => {
	return res.status(500).json({ message: 'Internal Server Error.' });
};

module.exports = handleError;
