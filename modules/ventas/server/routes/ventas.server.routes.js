'use strict';

module.exports = function(app) {
	var ventas = require('../controllers/ventas.server.controller');
	var ventasPolicy = require('../policies/ventas.server.policy');

	// Ventas Routes
	app.route('/api/ventas').all(ventasPolicy.isAllowed)
		.get(ventas.list)
		.put(ventas.ventasResumen)
		.post(ventas.create);

	app.route('/api/ventas/select').all(ventasPolicy.isAllowed)
		.get(ventas.select);

	app.route('/api/ventas/loadmore').all(ventasPolicy.isAllowed)
		.get(ventas.loadMore);

	app.route('/api/ventas/loadmoreByCaja').all(ventasPolicy.isAllowed)
		.get(ventas.loadMoreByCaja);		

	app.route('/api/ventas/loadmoreByCaja_Date').all()
		.get(ventas.loadmoreByCaja_Date);
		
    app.route('/api/ventas/loadmoreImpuestos').all(ventasPolicy.isAllowed)
        .get(ventas.loadMoreImpuestos);

	app.route('/api/ventas/mostrador').all(ventasPolicy.isAllowed);

    app.route('/api/ventas/print').all(ventasPolicy.isAllowed)
		.post(ventas.print);

	app.route('/api/ventas/:ventaId').all(ventasPolicy.isAllowed)
		.get(ventas.read)
		.put(ventas.update)
		.delete(ventas.delete);

	// Finish by binding the Venta middleware
	app.param('ventaId', ventas.ventaByID);
};
