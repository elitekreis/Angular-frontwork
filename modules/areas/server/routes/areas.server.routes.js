'use strict';

module.exports = function(app) {
	var areas = require('../controllers/areas.server.controller');
	var areasPolicy = require('../policies/areas.server.policy');

	// Areas Routes
	app.route('/api/areas').all()
		.get(areas.list).all(areasPolicy.isAllowed)
		.post(areas.create);

	app.route('/api/findAreaById').get(areas.findAreaById);

	app.route('/api/areas/:areaId').all(areasPolicy.isAllowed)
		.get(areas.read)
		.put(areas.update)
		.delete(areas.delete);

	// Finish by binding the Area middleware
	app.param('areaId', areas.areaByID);
};