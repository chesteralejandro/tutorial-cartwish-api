const mongoose = require('mongoose');

class Database {
	async connect() {
		try {
			await mongoose.connect(process.env.DATABASE_CONNECTION_STRING);
			console.log('✅ Success. Database is connected.');
		} catch (error) {
			throw new Error(error.message);
		}
	}
}

module.exports = new Database();
