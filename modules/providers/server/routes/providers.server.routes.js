'use strict';

module.exports = function(app) {
	var providers = require('../controllers/providers.server.controller');
	var providersPolicy = require('../policies/providers.server.policy');

	// Providers Routes
	app.route('/api/providers').all()
		.get(providers.list).all(providersPolicy.isAllowed)
		.post(providers.create);

	app.route('/api/providers/:providerId').all(providersPolicy.isAllowed)
		.get(providers.read)
		.put(providers.update)
		.delete(providers.delete);

	// Finish by binding the Provider middleware
	app.param('providerId', providers.providerByID);
};