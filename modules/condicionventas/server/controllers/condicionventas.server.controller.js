'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Condicionventa = mongoose.model('Condicionventa'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Condicionventa
 */
exports.create = function(req, res) {
	var condicionventa = new Condicionventa(req.body);
	condicionventa.user = req.user;

	condicionventa.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(condicionventa);
		}
	});
};

/**
 * Show the current Condicionventa
 */
exports.read = function(req, res) {
	res.jsonp(req.condicionventa);
};

/**
 * Update a Condicionventa
 */
exports.update = function(req, res) {
	var condicionventa = req.condicionventa ;

	condicionventa = _.extend(condicionventa , req.body);

	condicionventa.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(condicionventa);
		}
	});
};

/**
 * Delete an Condicionventa
 */
exports.delete = function(req, res) {
	console.log('entre condicion venta');
	var condicionventa = req.condicionventa ;
	condicionventa.deleted = true;
	condicionventa.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(condicionventa);
		}
	});
};

/**
 * List of Condicionventas
 */
exports.list = function(req, res) { 
	var enterprise = req.query.e || null;
	console.log('query', req.query);
	console.log('enterprise', enterprise);
	if (enterprise !== null) {
		Condicionventa.find({enterprise: enterprise})
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, condicionventas) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(condicionventas);
			}
		});
	}
	else{
		Condicionventa.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, condicionventas) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(condicionventas);
			}
		});
	}	
};

/**
 * Condicionventa middleware
 */
exports.condicionventaByID = function(req, res, next, id) {
 Condicionventa.findById(id)
 .populate('user', 'displayName')
 .populate('enterprise', 'name')
 .exec(function(err, condicionventa) {
		if (err) return next(err);
		if (! condicionventa) return next(new Error('Failed to load Condicionventa ' + id));
		req.condicionventa = condicionventa ;
		next();
	});
};


exports.loadMore = function(req, res) { 
	var enterprise = req.query.e || null;
	var name = req.query.name || null;

	console.log('condicionventas : name  : ' + name);
	

	if (enterprise !== null) {
		Condicionventa.find({enterprise: enterprise, name:name})
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, condicionventas) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(condicionventas);
			}
		});
	}
	else{
		Condicionventa.find({name: name})
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, condicionventas) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(condicionventas);
			}
		});
	}	
};