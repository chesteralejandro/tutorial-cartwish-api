const http = require('node:http');

const database = require('./database.js');

class Server {
	async listen(app) {
		try {
			const server = http.createServer(app);

			await database.connect();

			server.listen(process.env.PORT, () => {
				console.log('✅ Success. Server is listening.');
			});
		} catch (error) {
			console.error('❌', error.message);
		}
	}
}

module.exports = new Server();
