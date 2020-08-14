'use strict';

module.exports = function(app) {
	var liquidaciones = require('../controllers/liquidaciones.server.controller');
	var liquidacionesPolicy = require('../policies/liquidaciones.server.policy');

	// liquidaciones Routes
	app.route('/api/liquidaciones').all(liquidacionesPolicy.isAllowed)
		.get(liquidaciones.list)
		.put(liquidaciones.listByUser)
		.post(liquidaciones.create)
		.patch(liquidaciones.queryAll);

	app.route('/api/liquidaciones/:liquidacionId').all(liquidacionesPolicy.isAllowed)
		.get(liquidaciones.read)
		.put(liquidaciones.update)
		.delete(liquidaciones.delete);

	//app.route('/api/liquidaciones/all').all(liquidacionesPolicy.isAllowed)
		//.put(liquidaciones.queryAll);

	// Finish by binding the liquidacion middleware
	app.param('liquidacionId', liquidaciones.liquidacionByID);
};