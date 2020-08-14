'use strict';

module.exports = function(app) {
	var pedidos = require('../controllers/pedidos.server.controller');
	var pedidosPolicy = require('../policies/pedidos.server.policy');

	// Pedidos Routes
	app.route('/api/pedidos').all()
		.get(pedidos.list).all(pedidosPolicy.isAllowed)
		.post(pedidos.create);

    app.route('/api/pedidos/select').all(pedidosPolicy.isAllowed)
        .get(pedidos.select);

    app.route('/api/pedidos/loadmore').all(pedidosPolicy.isAllowed)
        .get(pedidos.loadMore);

    app.route('/api/pedidos/search').get(pedidos.search);

	app.route('/api/pedidos/:pedidoId').all(pedidosPolicy.isAllowed)
		.get(pedidos.read)
		.put(pedidos.update)
		.delete(pedidos.delete);

	// Finish by binding the Pedido middleware
	app.param('pedidoId', pedidos.pedidoByID);
};