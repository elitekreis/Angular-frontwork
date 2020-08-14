'use strict';

module.exports = function(app) {
	var entregas = require('../controllers/entregas.server.controller');
	var entregasPolicy = require('../policies/entregas.server.policy');

	// Entregas Routes
	app.route('/api/entregas').all()
		.get(entregas.list).all(entregasPolicy.isAllowed)
		.post(entregas.create);

	app.route('/api/entregas/:entregaId').all(entregasPolicy.isAllowed)
		.get(entregas.read)
		.put(entregas.update)
		.delete(entregas.delete);

	// Finish by binding the Entrega middleware
	app.param('entregaId', entregas.entregaByID);
};