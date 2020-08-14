'use strict';

module.exports = function(app) {
	var sucursales = require('../controllers/sucursales.server.controller');
	var sucursalesPolicy = require('../policies/sucursales.server.policy');

	// sucursales Routes
	app.route('/api/sucursales').all()
		.get(sucursales.list).all(sucursalesPolicy.isAllowed)
		.post(sucursales.create);

	app.route('/api/sucursales/:sucursalId').all(sucursalesPolicy.isAllowed)
		.get(sucursales.read)
		.put(sucursales.update)
		.delete(sucursales.delete);

	// Finish by binding the Comprobante middleware
	app.param('sucursalId', sucursales.sucursalByID);
};