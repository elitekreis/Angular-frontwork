'use strict';

module.exports = function(app) {
	var comprobantes = require('../controllers/comprobantes.server.controller');
	var comprobantesPolicy = require('../policies/comprobantes.server.policy');

	// Comprobantes Routes
	app.route('/api/comprobantes').all()
		.get(comprobantes.list).all(comprobantesPolicy.isAllowed)
		.post(comprobantes.create);

    app.route('/api/comprobantes/mostrador').all()
        .get(comprobantes.listMostrador).all(comprobantesPolicy.isAllowed);

	app.route('/api/comprobantes/:comprobanteId').all(comprobantesPolicy.isAllowed)
		.get(comprobantes.read)
		.put(comprobantes.update)
		.delete(comprobantes.delete);

	// Finish by binding the Comprobante middleware
	app.param('comprobanteId', comprobantes.comprobanteByID);
};