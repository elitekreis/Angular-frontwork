'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Provider = mongoose.model('Provider'),
	Finanza = mongoose.model('Finanza'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Provider
 */
exports.create = function(req, res) {
	var provider = new Provider(req.body);
	provider.user = req.user;

	var f = new Finanza();
		f.provider = provider._id;
		f.debe = 0;
		f.haber = 0;
		f.saldo = 0;
		f.tipoFinanza = 'debe';
		f.enterprise = provider.enterprise;
		f.deleted = false;
		f.created = Date.now();
		f.update = Date.now();
		f.user = provider.user;

	f.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			provider.finanza = f._id
			provider.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					console.log('provider creado');
				}
			});
			res.jsonp(provider);
		}
	});
};

/**
 * Show the current Provider
 */
exports.read = function(req, res) {
	res.jsonp(req.provider);
};

/**
 * Update a Provider
 */
exports.update = function(req, res) {
	var provider = req.provider ;

	provider = _.extend(provider , req.body);

	provider.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(provider);
		}
	});
};

/**
 * Delete an Provider
 */
exports.delete = function(req, res) {
	var provider = req.provider ;
	provider.deleted = true;
	provider.save(function(err) {
		if (err) {
			return res.status(400).send({

				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(provider);
		}
	});
};

/**
 * List of Providers
 */
exports.list = function(req, res) { 
	var enterprise = req.query.e || null;
	if (enterprise !== null) {
		Provider.find({ enterprise: enterprise})
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('category1')
		.populate('contacts', 'displayName email firstName lastName status phone')
		.populate('taxCondition', 'name')
		.populate('comprobante', 'name')
		.populate('condicionPago')
		.populate('productosAsociados')
		.exec(function(err, providers) {
			if (err) {
				console.log('e: ', err);
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(providers);
			}
		});
	} else {
		Provider.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('category1')
		.populate('contacts', 'displayName email firstName lastName status phone')
		.populate('taxCondition', 'name')
		.populate('comprobante', 'name')
		.populate('condicionPago')
		.populate('productosAsociados')
		.exec(function(err, providers) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(providers);
			}
		});
	};
	
};

/**
 * Provider middleware
 */
exports.providerByID = function(req, res, next, id) { 
	Provider.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.populate('category1')
	.populate('contacts', 'displayName email firstName lastName status phone')
	.populate('taxCondition', 'name')
	.populate('comprobante', 'name')
	.populate('condicionPago')
	.populate('productosAsociados')
	.exec(function(err, provider) {
		if (err) return next(err);
		if (! provider) return next(new Error('Failed to load Provider ' + id));
		req.provider = provider ;
		next();
	});
};