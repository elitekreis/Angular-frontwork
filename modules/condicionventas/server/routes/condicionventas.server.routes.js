'use strict';

module.exports = function(app) {
	var condicionventas = require('../controllers/condicionventas.server.controller');
	var condicionventasPolicy = require('../policies/condicionventas.server.policy');

	// Condicionventas Routes
	app.route('/api/condicionventas').all()
		.get(condicionventas.list).all(condicionventasPolicy.isAllowed)
		.post(condicionventas.create);

	// app.route('/api/condicionventas/:e').all()
	// 	.get(condicionventas.list);
	app.route('/api/condicionventas/loadmore').all(condicionventasPolicy.isAllowed)
	.get(condicionventas.loadMore);

	app.route('/api/condicionventas/:condicionventaId').all(condicionventasPolicy.isAllowed)
		.get(condicionventas.read)
		.put(condicionventas.update)
		.delete(condicionventas.delete);

	// Finish by binding the Condicionventa middleware
	app.param('condicionventaId', condicionventas.condicionventaByID);
};