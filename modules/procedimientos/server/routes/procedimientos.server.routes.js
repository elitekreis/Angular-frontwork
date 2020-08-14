'use strict';

module.exports = function(app) {
	var procedimientos = require('../controllers/procedimientos.server.controller');
	var procedimientosPolicy = require('../policies/procedimientos.server.policy');

	// Procedimientos Routes
	app.route('/api/procedimientos').all()
		.get(procedimientos.list).all(procedimientosPolicy.isAllowed)
		.post(procedimientos.create);

	app.route('/api/procedimientos/:procedimientoId').all(procedimientosPolicy.isAllowed)
		.get(procedimientos.read)
		.put(procedimientos.update)
		.delete(procedimientos.delete);

	// Finish by binding the Procedimiento middleware
	app.param('procedimientoId', procedimientos.procedimientoByID);
};