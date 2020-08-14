'use strict';

module.exports = function(app) {
	var actividades = require('../controllers/actividades.server.controller');
	var actividadesPolicy = require('../policies/actividades.server.policy');

	// actividades Routes
	app.route('/api/actividades').all(actividadesPolicy.isAllowed)
		.get(actividades.list)
		.put(actividades.listByUser)
		.post(actividades.create);

	app.route('/api/actividades/:actividadId').all(actividadesPolicy.isAllowed)
		.get(actividades.read)
		.put(actividades.update)
		.delete(actividades.delete);

	// Finish by binding the actividad middleware
	app.param('actividadId', actividades.actividadByID);
};