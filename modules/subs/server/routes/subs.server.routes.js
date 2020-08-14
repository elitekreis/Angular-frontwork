'use strict';

module.exports = function(app) {
	var subs = require('../controllers/subs.server.controller');
	var subsPolicy = require('../policies/subs.server.policy');

	// Subs Routes
	app.route('/api/subs').all()
		.get(subs.list).all(subsPolicy.isAllowed)
		.post(subs.create);

	app.route('/api/subs/:subId').all(subsPolicy.isAllowed)
		.get(subs.read)
		.put(subs.update)
		.delete(subs.delete);

	// Finish by binding the Sub middleware
	app.param('subId', subs.subByID);
};