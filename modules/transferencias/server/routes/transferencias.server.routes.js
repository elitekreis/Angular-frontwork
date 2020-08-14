'use strict';

module.exports = function(app) {
	var transferencias = require('../controllers/transferencias.server.controller');
	var transferenciasPolicy = require('../policies/transferencias.server.policy');

	// Comprobantes Routes
	app.route('/api/transferencias').all()
		.get(transferencias.list).all(transferenciasPolicy.isAllowed)
		.post(transferencias.create);

	app.route('/api/transferencias/loadmorebycaja').all()
		.get(transferencias.loadmorebycaja);
	
	app.route('/api/transferencias/loadmorebycaja_date').all()
		.get(transferencias.loadmorebycaja_date);		

	app.route('/api/transferencias/:transferenciaId').all(transferenciasPolicy.isAllowed)
		.get(transferencias.read)
		.put(transferencias.update)
		.delete(transferencias.delete);

	// Finish by binding the Comprobante middleware
	app.param('transferenciaId', transferencias.transferenciaByID);
};