'use strict';

module.exports = function(app) {
	var clients = require('../controllers/clients.server.controller');
	var clientsPolicy = require('../policies/clients.server.policy');

	// Clients Routes
	app.route('/api/clients').all()
		.get(clients.list).all(clientsPolicy.isAllowed)
		.post(clients.create);

	app.route('/api/clients/bylocation').all()
		.get(clients.listByLocation).all(clientsPolicy.isAllowed)

	app.route('/api/clients/:clientId').all(clientsPolicy.isAllowed)
		.get(clients.read)
		.put(clients.update)
		.delete(clients.delete);

	// Finish by binding the Client middleware
	app.param('clientId', clients.clientByID);
};