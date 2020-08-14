'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Moment = require('moment'),
	Stock = mongoose.model('Stock'),
	Product = mongoose.model('Product'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Stock
 */
exports.create = function(req, res, next) {
	var d = new Moment();
	var stock = new Stock(req.body);
	stock.user = req.user;
	stock.filterDate = {
		year: d.year().toString(), 											// 2015
		quarter: d.year().toString() + '-' + d.quarter().toString() + 'Q', 	// 2015-1Q
		month: d.year().toString() + '-' + d.month().toString(), 			// 2015-7
		week: d.year().toString() + '-' + d.week().toString(), 				// 2015-29
		day: d.year().toString() + '-' + d.dayOfYear().toString(),			// 2015-191
		dayOfWeek: d.weekday(),												// 3 (Miercoles)
		Hour: d.hour() 														// 11
	};

	switch (stock.action) {
		case 'agregar':
			productoConId(stock.product, function(err, p){
				if(err !== null) {
					console.log(err, '--errr-buscar producto');
                } else {
					var idxStock = getStockByCostCenter(stock.costCenter, p);
					if(idxStock != null) {
						var lastStockValue 	= p.stocks[idxStock].unitsInStock,
						newValue = stock.amount + lastStockValue;
						p.stocks[idxStock].unitsInStock = newValue;
						p.updated = new Date();
						p.save(function(err) {
							if (err){
								console.log(err, 'error guardar producto');
							}
							else{
								stock.newValue = newValue;
								stock.lastValue = lastStockValue;
								stock.save(function(err) {
									if (err) {
										console.log('error crear stock');
										return res.status(400).send({
											message: errorHandler.getErrorMessage(err)
										});
									} else {
										console.log('cree stock ok');
										res.jsonp(stock);
									}
								});
							}
						})
					}else{
						return res.status(400).send({
							message: "There is no stock for that cost center"
						});
					}
                }
			})	
		break;

		case 'suprimir':
			productoConId(stock.product, function(err, p){
				if(err !== null) {
					console.log(err, '--errr-buscar producto');
                } else {
					var idxStock = getStockByCostCenter(stock.costCenter, p);
					if(idxStock != null){
						var lastStockValue 	= p.stocks[idxStock].unitsInStock,
						newValue = lastStockValue - stock.amount;

						p.stocks[idxStock].unitsInStock = newValue;
						p.updated = new Date();
						p.save(function(err) {
							if (err){
								console.log(err, 'error guardar producto');
							}
							else{
								stock.newValue = newValue;
								stock.lastValue = lastStockValue;
								stock.save(function(err) {
									if (err) {
										console.log('error crear stock');
										return res.status(400).send({
											message: errorHandler.getErrorMessage(err)
										});
									} else {
										console.log('cree stock ok');
										res.jsonp(stock);
									}
								});
							}
						})
					}else{
						return res.status(400).send({
							message: "There is no stock for that cost center"
						});
					}
                }
            })    	
		break;

		case 'pedido':
			Product.findById(stock.product._id)
			.exec(function(err, product) {
				if (err) return next(err);
				if (!product) return next(new Error('Failed to load Product ' + id));
				var lastStockValue 	= product.unitsInStock,
				newValue 			= stock.amount + lastStockValue;

				product.unitsOnOrder = stock.amount;
				product.updated = new Date();

				product.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						//res.jsonp(stock);
						stock.newValue = lastStockValue;
						stock.lastValue = lastStockValue;



						stock.save(function(err) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								res.jsonp(stock);
							}
						});
					}
				});

				

				//next();
			});
		break;

		case 'pedido recibido':
			Product.findById(stock.product._id)
			.exec(function(err, product) {
				if (err) return next(err);
				if (! product) return next(new Error('Failed to load Product ' + id));
				var lastStockValue 	= product.unitsInStock,
				newValue 			= stock.amount + lastStockValue;

				product.unitsInStock = newValue;
				product.unitsOnOrder = 0;
				product.updated = new Date();
				
				product.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						//res.jsonp(stock);
						stock.newValue = newValue;
						stock.lastValue = lastStockValue;



						stock.save(function(err) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								Stock.findById(stock.reference)
								.exec(function(err, stock) {
									if (err) return next(err);
									if (! stock) return next(new Error('Failed to load Stock ' + id));

									stock.received = true;

									stock.save(function(err) {
										if (err) {
											return res.status(400).send({
												message: errorHandler.getErrorMessage(err)
											});
										} else {
											res.jsonp(stock);
										}
									});

									

									//next();
								});

								
							}
						});
					}
				});

				

				//next();
			});
		break;
	}
};

/**
 * Show the current Stock
 */
exports.read = function(req, res) {
	res.jsonp(req.stock);
};

/**
 * Update a Stock
 */
exports.update = function(req, res) {
	var stock = req.stock ;

	stock = _.extend(stock , req.body);

	stock.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(stock);
		}
	});
};

/**
 * Delete an Stock
 */
exports.delete = function(req, res) {
	var stock = req.stock ;

	stock.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(stock);
		}
	});
};

/**
 * List of Stocks
 */
exports.list = function(req, res) { 
	var enterprise = req.query.e || null;
		
	if (enterprise !== null) {
		Stock.find({enterprise: enterprise})		
		.sort('created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		//.populate('product')
		.exec(function(err, stocks) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(stocks);
			}
		});
	} else {
		Stock.find()		
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		//.populate('product')
		.exec(function(err, stocks) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(stocks);
			}
		});
	};
	
};

exports.listOrdersForProduct = function(req, res) { 
	var enterprise = req.query.e || null;
	var productID = req.params.productID || null;
	console.log('enterprise: %s product: %s', enterprise, productID);
	if (enterprise !== null) {
		Stock.find({$and: [{'product._id': productID }, { received: false}, { action: 'pedido'}, { enterprise: enterprise}] })
		//.where()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		//.populate('product')
		.exec(function(err, stocks) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				console.log('resultado: ', stocks);
				res.jsonp(stocks);
			}
		});
	} else {
		Stock.find({$and: [{'product._id': productID }, { received: false}, { action: 'pedido'}] })
		//.where()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		//.populate('product')
		.exec(function(err, stocks) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				console.log('resultado: ', stocks);
				res.jsonp(stocks);
			}
		});
	};
	
};

/**
 * Stock middleware
 */
exports.stockByID = function(req, res, next, id) { 
	Stock.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.populate('product')
	.exec(function(err, stock) {
		if (err) return next(err);
		if (! stock) return next(new Error('Failed to load Stock ' + id));
		req.stock = stock ;
		next();
	});
};

function productoConId(p, callback){
    Product.findById(p)
    .populate('produccion.producto', 'name costPerUnit')
    .exec(function(err, product) {
      if (!err) {
        return callback(null, product);
      } else {
        console.log("[E] productoConId::Product.findById: ", err);
        return callback(err);
      }
    });
  };

//joker's add
function getStockByCostCenter(id, product) {
	if(product.stocks !== null){
		for(var i=0; i<product.stocks.length; i++){
			if(product.stocks[i].costCenter == id) {
				return i;
			}
		}
	}
	return null;
}