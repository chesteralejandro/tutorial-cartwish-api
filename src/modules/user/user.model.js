const mongoose = require('mongoose');

const USER_VALIDATION = {
	name: { type: String, required: true, mingLength: 3 },
	email: { type: String, required: true, unique: true, lowercase: true },
	password: { type: String, required: false },
	googleId: { type: String, unique: true },
	facebookId: { type: String, unique: true },
	deliveryAddress: { type: String, required: false },
	role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
	refreshToken: { type: String },
};

const USER_COLLECTION_NAME = 'User';
const USER_SCHEMA = new mongoose.Schema(USER_VALIDATION);

const User = mongoose.model(USER_COLLECTION_NAME, USER_SCHEMA);

module.exports = User;
