'use strict';

module.exports = function(app) {
	var procesos = require('../controllers/procesos.server.controller');
	var procesosPolicy = require('../policies/procesos.server.policy');

	// Procesos Routes
	app.route('/api/procesos').all()
		.get(procesos.list).all(procesosPolicy.isAllowed)
		.post(procesos.create);

	app.route('/api/procesos/:procesoId').all(procesosPolicy.isAllowed)
		.get(procesos.read)
		.put(procesos.update)
		.delete(procesos.delete);

	// Finish by binding the Proceso middleware
	app.param('procesoId', procesos.procesoByID);
};