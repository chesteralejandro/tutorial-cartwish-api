const express = require('express');

const server = require('./config/server.js');

const app = express();

function startApp() {
	try {
		server.listen(app);
	} catch (error) {
		console.error('❌', error.message);
	}
}

startApp();
