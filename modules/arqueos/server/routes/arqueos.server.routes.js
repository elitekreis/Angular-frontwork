'use strict';

module.exports = function(app) {
	var arqueos = require('../controllers/arqueos.server.controller');
	var arqueosPolicy = require('../policies/arqueos.server.policy');

	// cajas Routes
	app.route('/api/arqueos').all()
		.get(arqueos.list).all(arqueosPolicy.isAllowed)
		.post(arqueos.create);

	app.route('/api/arqueos/loadmoreByCaja').all()
		.get(arqueos.loadmoreByCaja).all(arqueosPolicy.isAllowed)
	
	app.route('/api/arqueos/loadmoreByCaja_Date').all()
		.get(arqueos.loadmoreByCaja_Date)

	app.route('/api/arqueos/:arqueoId').all(arqueosPolicy.isAllowed)
		.get(arqueos.read)
		.put(arqueos.update)
		.delete(arqueos.delete);

	// Finish by binding the Comprobante middleware
	app.param('arqueoId', arqueos.arqueoByID);
};