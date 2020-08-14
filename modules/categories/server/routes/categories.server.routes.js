'use strict';

module.exports = function(app) {
	var categories = require('../controllers/categories.server.controller');
	var categoriesPolicy = require('../policies/categories.server.policy');

	// Categories Routes
	app.route('/api/categories').all()
		.get(categories.list).all(categoriesPolicy.isAllowed)
		.post(categories.create);

    app.route('/api/categories/mostrador').all()
        .get(categories.listMostrador).all(categoriesPolicy.isAllowed);

	app.route('/api/categories/:categoryId').all(categoriesPolicy.isAllowed)
		.get(categories.read)
		.put(categories.update)
		.delete(categories.delete);

	// Finish by binding the Category middleware
	app.param('categoryId', categories.categoryByID);
};