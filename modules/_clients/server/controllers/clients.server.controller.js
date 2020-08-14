'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Client = mongoose.model('Cliente'),
	Finanza = mongoose.model('Finanza'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Client
 */
exports.create = function(req, res) {
	var cliente = new Client(req.body);
	cliente.user = req.user;

	var f = new Finanza();
		f.client = cliente._id;
		f.debe = 0;
		f.haber = 0;
		f.saldo = 0;
		f.tipoFinanza = 'haber';
		f.enterprise = cliente.enterprise;
		f.deleted = false;
		f.created = Date.now();
		f.update = Date.now();
		f.user = cliente.user;

	f.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			cliente.finanza = f._id
			cliente.save(function(err) {
				if (err) {
					// console.log(cliente.loc);
					// console.log(err);
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(cliente);
				}
			});
		}
	});		
};

/**
 * Show the current Client
 */
exports.read = function(req, res) {
	res.jsonp(req.cliente);
};

/**
 * Update a Client
 */
exports.update = function(req, res) {
	var cliente = req.cliente ;
	// console.log(cliente);
	cliente = _.extend(cliente , req.body);

	cliente.save(function(err) {
		if (err) {
			// console.log('[-] Clientes::update: ', err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(cliente);
		}
	});
};

exports.updateClient = function(req, res) {
	var cliente = req.cliente ;
	// console.log(cliente);
	cliente = _.extend(cliente , req.body);

	cliente.save(function(err) {
		if (err) {
			// console.log('[-] Clientes::updateClient: ', err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(cliente);
		}
	});
};

// exports.updateClient = function(req, res) {
// 	var cliente = req.cliente ;
// 	console.log(cliente);
//  	cliente = _.extend(cliente , req.body);

//  	cliente.save(function(err) {
//  		if (err) {
//  			return res.status(400).send({
//  				message: errorHandler.getErrorMessage(err)
//  			});
//  		} else {
//  			res.jsonp(cliente);
//  		}
//  	});
//  };

/**
 * Delete an Client
 */
exports.delete = function(req, res) {
	var cliente = req.cliente ;
	cliente.deleted = true;
	cliente.save(function(err) {
		if (err) {
			// console.log('[-] Clientes::delete: ', err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(cliente);
		}
	});
};

/**
 * List of Clients
 */
exports.list = function(req, res) {
	var enterprise = req.query.e || null;
	if (enterprise !== null) {
		Client.find({enterprise: enterprise})
		.sort('-created')
		.populate('user', 'displayName enterprise')
		.populate('enterprise', 'name')
		.populate('sub', 'name')
		.populate('contact', 'displayName email')
		.populate('taxCondition', 'name')
		.populate('product', 'name')
		.populate('category1', 'name')
		.populate('condicionPago')
		.populate('comprobante')
		.populate('productosAsociados')
		.exec(function(err, clientes) {
				if (err) {
					// console.log('[-] Clientes::list: ', err);
					return res.status(400).send({

						message: errorHandler.getErrorMessage(err)
					});
				} else {
					// console.log('[+] Clientes::list:enterprise: ', clientes);
					res.jsonp(clientes);
				}
			});
	} else {
		Client.find().sort('-created')
		.populate('user', 'displayName enterprise')
		.populate('enterprise', 'name')
		.populate('sub', 'name')
		.populate('contact', 'displayName email')
		.populate('taxCondition', 'name')
		.populate('product', 'name')
		.populate('category1', 'name')
		.populate('condicionPago')
		.populate('comprobante')
		.populate('productosAsociados')
		.exec(function(err, clientes) {
				if (err) {
					// console.log('[-] Clientes::list: ', err);
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					// console.log('[+] Clientes::list: ', clientes);
					res.jsonp(clientes);
				}
			});
	};

};

exports.listByLocation = function(req, res) {
	var enterprise = req.query.e || null;
	var startPoint = req.query.p || null;
	startPoint = [parseFloat(startPoint[0]), parseFloat(startPoint[1])];
	console.log('---> Punto de inicio: ', startPoint);
	var maxDistance = 50; // 50 km radius
	maxDistance /= 6371; // convert distance to radians (6371 radius of earth)

	console.log('startPoint: ', startPoint);

	if (enterprise !== null) {
		Client.find({enterprise: enterprise, loc: {$near: startPoint /*, $maxDistance: maxDistance */}})
		.populate('user', 'displayName enterprise')
		.populate('enterprise', 'name')
		.populate('sub', 'name')
		.populate('contact', 'displayName email')
		.populate('taxCondition', 'name')
		.populate('product', 'name')
		.populate('category1', 'name')
		.populate('condicionPago')
		.populate('comprobante')
		.populate('productosAsociados')
		.exec(function(err, clientes) {
				if (err) {
					console.log('[-] Clientes::listByLocation: ', err);
					return res.status(400).send({

						message: errorHandler.getErrorMessage(err)
					});
				} else {
					//console.log('<<<<<<----- clientes: ', clientes);
					res.jsonp(clientes);
				}
			});
	} else {
		Client.find({loc: {$near: startPoint /*, $maxDistance: maxDistance */}})
		.populate('user', 'displayName enterprise')
		.populate('enterprise', 'name')
		.populate('sub', 'name')
		.populate('contact', 'displayName email')
		.populate('taxCondition', 'name')
		.populate('product', 'name')
		.populate('category1', 'name')
		.populate('condicionPago')
		.populate('comprobante')
		.populate('productosAsociados')
		.exec(function(err, clientes) {
				if (err) {
					console.log('[-] Clientes::listByLocation: ', err);
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(clientes);
				}
			});
	};

};

/**
 * Client middleware
 */
exports.clientByID = function(req, res, next, id) {
	Client.findById(id)
	.populate('user', 'displayName enterprise')
	.populate('userLogin')
	.populate('enterprise', 'name')
	.populate('sub', 'name')
	.populate('contacts')
	.populate('taxCondition', 'name')
	.populate('product', 'name')
	.populate('category1', 'name')
	.populate('condicionPago')
	.populate('comprobante')
	.populate('productosAsociados')
	.exec(function(err, cliente) {
		if (err) return next(err);
		if (! cliente) return next(new Error('Failed to load Client ' + id));
		req.cliente = cliente ;
		next();
	});
};
