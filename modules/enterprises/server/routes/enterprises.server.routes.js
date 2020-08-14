'use strict';

module.exports = function(app) {
	var enterprises = require('../controllers/enterprises.server.controller');
	var enterprisesPolicy = require('../policies/enterprises.server.policy');

	// Enterprises Routes
	app.route('/api/enterprises').all()
		.get(enterprises.list).all(enterprisesPolicy.isAllowed)
		.post(enterprises.create);

	app.route('/api/enterprises/:enterpriseId').all(enterprisesPolicy.isAllowed)
		.get(enterprises.read)
		.put(enterprises.update)
		.delete(enterprises.delete);

	// Finish by binding the Enterprise middleware
	app.param('enterpriseId', enterprises.enterpriseByID);
};