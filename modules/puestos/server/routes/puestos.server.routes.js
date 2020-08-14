'use strict';

module.exports = function(app) {
	var puestos = require('../controllers/puestos.server.controller');
	var puestosPolicy = require('../policies/puestos.server.policy');

	// Puestos Routes
	app.route('/api/puestos').all()
		.get(puestos.list)
		.all(puestosPolicy.isAllowed)
		.post(puestos.create);

	app.route('/api/puestos/:puestoId').all(puestosPolicy.isAllowed)
		.get(puestos.read)
		.put(puestos.update)
		.delete(puestos.delete);

	app.route('/api/editarEstadoPuesto')
		.put(puestos.editarEstado);

	app.route('/api/puestoByAreaId').get(puestos.puestoByAreaId);

	// Finish by binding the Puesto middleware
	app.param('puestoId', puestos.puestoByID);
};