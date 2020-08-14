'use strict';

module.exports = function(app) {
	var finanzas = require('../controllers/finanzas.server.controller');
	var finanzasPolicy = require('../policies/finanzas.server.policy');

	// finanzas Routes
	app.route('/api/finanzas').all()
		.get(finanzas.list).all(finanzasPolicy.isAllowed)
		.post(finanzas.create);

	app.route('/api/finanzas/:finanzaId').all(finanzasPolicy.isAllowed)
		.get(finanzas.read)
		.put(finanzas.update)
		.delete(finanzas.delete);

	// Finish by binding the finanza middleware
	app.param('finanzaId', finanzas.finanzaByID);
};