'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Procedimiento = mongoose.model('Procedimiento'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Procedimiento
 */
exports.create = function(req, res) {
	var procedimiento= new Procedimiento(req.body);
	procedimiento.user = req.user;

	procedimiento.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(procedimiento);
		}
	});
};

/**
 * Show the current Procedimiento
 */
exports.read = function(req, res) {
	res.jsonp(req.procedimiento);
};

/**
 * Update a Procedimiento
 */
exports.update = function(req, res) {
	var procedimiento = req.procedimiento ;

	procedimiento = _.extend(procedimiento , req.body);

	procedimiento.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(procedimiento);
		}
	});
};

/**
 * Delete an Procedimiento
 */
exports.delete = function(req, res) {
	var procedimiento = req.procedimiento ;
	procedimiento.deleted = true;
	procedimiento.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(procedimiento);
		}
	});
};

/**
 * List of Procedimientos
 */
exports.list = function(req, res) { 
	var enterprise = req.query.e || null;
	if (enterprise !== null) {
		Procedimiento.find({ enterprise: enterprise})
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('puesto', 'name')
		.populate('procedimientosAgregados', 'name description')
		.exec(function(err, procedimientos) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(procedimientos);
			}
		});
	} else {
		Procedimiento.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('puesto', 'name')
		.populate('procedimientosAgregados', 'name description')
		.exec(function(err, procedimientos) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(procedimientos);
			}
		});
	};
		
};

/**
 * Procedimiento middleware
 */
exports.procedimientoByID = function(req, res, next, id) { 
	Procedimiento.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.populate('puesto', 'name')
	.populate('procedimientosAgregados', 'name description')
	.exec(function(err, procedimiento) {
		if (err) return next(err);
		if (! procedimiento) return next(new Error('Failed to load Procedimiento ' + id));
		req.procedimiento = procedimiento ;
		next();
	});
};