const mongoose = require('mongoose');

const CATEGORY_VALIDATION = {
	name: { type: String, required: true, unique: true },
	image: { type: String, required: true },
};

const CATEGORY_COLLECTION_NAME = 'Category';
const CATEGORY_SCHEMA = new mongoose.Schema(CATEGORY_VALIDATION);

const Category = mongoose.model(CATEGORY_COLLECTION_NAME, CATEGORY_SCHEMA);

module.exports = Category;
