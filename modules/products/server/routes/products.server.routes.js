'use strict';

module.exports = function(app) {
	var products = require('../controllers/products.server.controller');
	var productsPolicy = require('../policies/products.server.policy');

	// Products Routes
	app.route('/api/products').all()
		.get(products.list).all(productsPolicy.isAllowed)
		.post(products.create);

    app.route('/api/products/mostrador').all()
        .get(products.listMostrador).all(productsPolicy.isAllowed);

	app.route('/api/products/:productId').all(productsPolicy.isAllowed)
		.get(products.read)
		.put(products.update)
		.delete(products.delete);

	// Finish by binding the Product middleware
	app.param('productId', products.productByID);
};