'use strict';

module.exports = function(app) {
	var compras = require('../controllers/compras.server.controller');
	var comprasPolicy = require('../policies/compras.server.policy');

	// Compras Routes
	app.route('/api/compras').all(comprasPolicy.isAllowed)
		.get(compras.list)
		.put(compras.comprasResumen)
		.post(compras.create);

    app.route('/api/compras/select').all(comprasPolicy.isAllowed)
        .get(compras.select);

	app.route('/api/compras/loadmore').all(comprasPolicy.isAllowed)	
		.get(compras.loadMore);
		
	app.route('/api/compras/loadmorebycaja').all(comprasPolicy.isAllowed)
		.get(compras.loadMoreByCaja);
	
	app.route('/api/compras/loadmorebycaja_date').all()
        .get(compras.loadMoreByCajaDate);		

    app.route('/api/compras/loadmoreImpuestos').all(comprasPolicy.isAllowed)
        .get(compras.loadMoreImpuestos);

    app.route('/api/compras/search').get(compras.searchCompras);

	app.route('/api/compras/:compraId').all(comprasPolicy.isAllowed)
		.get(compras.read)
		.put(compras.update)
		.delete(compras.delete);

	// Finish by binding the Compra middleware
	app.param('compraId', compras.compraByID);
};