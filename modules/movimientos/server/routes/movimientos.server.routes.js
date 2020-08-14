'use strict';

module.exports = function(app) {
	var movimientos = require('../controllers/movimientos.server.controller');
	var movimientosPolicy = require('../policies/movimientos.server.policy');

	// movimientos Routes
	app.route('/api/movimientos').all()
		.get(movimientos.list).all(movimientosPolicy.isAllowed)
		.post(movimientos.create);

	app.route('/api/movimientos/loadmore').all(movimientosPolicy.isAllowed)
		.get(movimientos.loadMore);
		
	app.route('/api/movimientos/loadmorebydate').all()
		.get(movimientos.loadMoreByDate);				

	app.route('/api/movimientos/:movimientoId').all(movimientosPolicy.isAllowed)
		.get(movimientos.read)
		.put(movimientos.update)
		.delete(movimientos.delete);
	
	// Finish by binding the Comprobante middleware
	app.param('movimientoId', movimientos.movimientoByID);
};

