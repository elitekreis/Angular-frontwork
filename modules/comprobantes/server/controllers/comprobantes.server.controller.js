'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Comprobante = mongoose.model('Comprobante'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Comprobante
 */
exports.create = function(req, res) {
	var comprobante = new Comprobante(req.body);
	comprobante.user = req.user;

	comprobante.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(comprobante);
		}
	});
};

/**
 * Show the current Comprobante
 */
exports.read = function(req, res) {
	res.jsonp(req.comprobante);
};

/**
 * Update a Comprobante
 */
exports.update = function(req, res) {
	var comprobante = req.comprobante ;

	comprobante = _.extend(comprobante , req.body);

	comprobante.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(comprobante);
		}
	});
};

/**
 * Delete an Comprobante
 */
exports.delete = function(req, res) {
	var comprobante = req.comprobante ;
	comprobante.deleted = true;
	comprobante.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(comprobante);
		}
	});
};

/**
 * List of Comprobantes
 */
exports.list = function(req, res) {
	var enterprise = req.query.e || null;
	if (enterprise !== null) {
		Comprobante.find({enterprise: enterprise})
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, comprobantes) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(comprobantes);
			}
		});
	}	
	else{
		Comprobante.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, comprobantes) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(comprobantes);
			}
		});
	}
};

/**
 * List of Comprobantes for the mostrador page
 */
exports.listMostrador = function(req, res) {
    var enterprise = req.query.e;
    var exclude = req.query.exclude;

	Comprobante.find({enterprise: enterprise, name: {$ne: exclude}})
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, comprobantes) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(comprobantes);
			}
		});
};

/**
 * Comprobante middleware
 */
exports.comprobanteByID = function(req, res, next, id) { 
	Comprobante.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.exec(function(err, comprobante) {
		if (err) return next(err);
		if (! comprobante) return next(new Error('Failed to load Comprobante ' + id));
		req.comprobante = comprobante ;
		next();
	});
};