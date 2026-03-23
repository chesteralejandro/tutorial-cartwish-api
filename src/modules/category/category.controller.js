const Category = require('./category.model');

const { STATUS_CODES } = require('../../config/constants');

class CategoryController {
	async getCategories(_req, res) {
		const categories = await Category.find().sort('name');
		res.status(STATUS_CODES.OK).json(categories);
	}

	async create(req, res) {
		if (!req.body.name || !req.file) {
			res.status(STATUS_CODES.BAD_REQUEST).json({
				message: 'Name and icon are required',
			});

			return;
		}

		const newCategory = new Category({
			name: req.body.name,
			image: req.file.filename,
		});

		await newCategory.save();

		res.status(STATUS_CODES.CREATED).json({
			message: 'Category added successfully!',
		});
	}
}

module.exports = new CategoryController();
