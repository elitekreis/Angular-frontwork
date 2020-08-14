'use strict';

module.exports = function(app) {
	var historialCompras = require('../controllers/historialCompras.server.controller');
	var historialComprasPolicy = require('../policies/historialCompras.server.policy');

	// HistorialCompras Routes
	app.route('/api/historialCompras').all()
		.get(historialCompras.list).all(historialComprasPolicy.isAllowed)
		.post(historialCompras.create);

};