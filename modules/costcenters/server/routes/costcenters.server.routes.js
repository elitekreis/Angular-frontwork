'use strict';

module.exports = function(app) {
	var costcenters = require('../controllers/costcenters.server.controller');
	var costcentersPolicy = require('../policies/costcenters.server.policy');

	// Costcenters Routes
	app.route('/api/costcenters').all()
		.get(costcenters.list).all(costcentersPolicy.isAllowed)
		.post(costcenters.create);

	app.route('/api/costcenters/:costcenterId').all(costcentersPolicy.isAllowed)
		.get(costcenters.read)
		.put(costcenters.update)
		.delete(costcenters.delete);

	// Finish by binding the Costcenter middleware
	app.param('costcenterId', costcenters.costcenterByID);
};