'use strict';

module.exports = function(app) {
	var taxconditions = require('../controllers/taxconditions.server.controller');
	var taxconditionsPolicy = require('../policies/taxconditions.server.policy');

	// Taxconditions Routes
	app.route('/api/taxconditions').all()
		.get(taxconditions.list).all(taxconditionsPolicy.isAllowed)
		.post(taxconditions.create);

	app.route('/api/taxconditions/:taxconditionId').all(taxconditionsPolicy.isAllowed)
		.get(taxconditions.read)
		.put(taxconditions.update)
		.delete(taxconditions.delete);

	// Finish by binding the Taxcondition middleware
	app.param('taxconditionId', taxconditions.taxconditionByID);
};