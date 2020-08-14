'use strict';

module.exports = function(app) {
	var stocks = require('../controllers/stocks.server.controller');
	var stocksPolicy = require('../policies/stocks.server.policy');

	// Stocks Routes
	app.route('/api/stocks').all()
		.get(stocks.list).all(stocksPolicy.isAllowed)
		.post(stocks.create);

	app.route('/api/stocks/:stockId').all(stocksPolicy.isAllowed)
		.get(stocks.read)
		.put(stocks.update)
		.delete(stocks.delete);

	app.route('/api/stocks/orders/:productID').all(stocksPolicy.isAllowed)
		.get(stocks.listOrdersForProduct);

	// Finish by binding the Stock middleware
	app.param('stockId', stocks.stockByID);
};