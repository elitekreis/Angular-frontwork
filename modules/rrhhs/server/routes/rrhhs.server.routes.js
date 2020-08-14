'use strict';

module.exports = function(app) {
	var rrhhs = require('../controllers/rrhhs.server.controller');
	var rrhhsPolicy = require('../policies/rrhhs.server.policy');

	// Rrhhs Routes
	app.route('/api/rrhhs').all()
		.get(rrhhs.list).all(rrhhsPolicy.isAllowed)
		.post(rrhhs.create);

	app.route('/api/rrhhs/:rrhhId').all(rrhhsPolicy.isAllowed)
		.get(rrhhs.read)
		.put(rrhhs.update)
		.delete(rrhhs.delete);

	// Finish by binding the Rrhh middleware
	app.param('rrhhId', rrhhs.rrhhByID);
};