const { required } = require('joi');
const mongoose = require('mongoose');

const PRODUCT_VALIDATION = {
	title: { type: String, required: true, maxlength: 100 },
	description: { type: String, required: true, minlength: 50 },
	seller: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category',
		required: true,
	},
	price: { type: Number, required: true, min: 0 },
	stock: { type: Number, required: true, min: 0 },
	images: { type: [String], required: true },
	reviews: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				required: true,
			},
			rating: { type: Number, required: true, min: 0 },
			comment: { type: String, required: false },
		},
	],
};

const PRODUCT_COLLECTION_NAME = 'Product';
const PRODUCT_SCHEMA = new mongoose.Schema(PRODUCT_VALIDATION);

const Product = mongoose.model(PRODUCT_COLLECTION_NAME, PRODUCT_SCHEMA);

module.exports = Product;
