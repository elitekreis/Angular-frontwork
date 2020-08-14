'use strict';

module.exports = function(app) {
	var remuneraciones = require('../controllers/remuneraciones.server.controller');
	var remuneracionesPolicy = require('../policies/remuneraciones.server.policy');

	// Remuneraciones Routes
	app.route('/api/remuneraciones').all(remuneracionesPolicy.isAllowed)
		.get(remuneraciones.list)
		.post(remuneraciones.create);

	app.route('/api/remuneraciones/:remuneracioneId').all(remuneracionesPolicy.isAllowed)
		.get(remuneraciones.read)
		.put(remuneraciones.update)
		.delete(remuneraciones.delete)
		.post(remuneraciones.read);

	// Finish by binding the Remuneracione middleware
	app.param('remuneracioneId', remuneraciones.remuneracioneByID);
};