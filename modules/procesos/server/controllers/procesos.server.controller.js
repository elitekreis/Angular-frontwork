'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Proceso = mongoose.model('Proceso'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Proceso
 */
exports.create = function(req, res) {
	var proceso = new Proceso(req.body);
	proceso.user = req.user;

	proceso.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(proceso);
		}
	});
};

/**
 * Show the current Proceso
 */
exports.read = function(req, res) {
	res.jsonp(req.proceso);
};

/**
 * Update a Proceso
 */
exports.update = function(req, res) {
	var proceso = req.proceso ;

	proceso = _.extend(proceso , req.body);

	proceso.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(proceso);
		}
	});
};

/**
 * Delete an Proceso
 */
exports.delete = function(req, res) {
	var proceso = req.proceso ;
	proceso.deleted = true;
	proceso.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(proceso);
		}
	});
};

/**
 * List of Procesos
 */
exports.list = function(req, res) { 
	var enterprise = req.query.e || null;
	if (enterprise !== null) {
		Proceso.find({ enterprise: enterprise})
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('category', 'name')
		.populate('sub', 'name')
		.populate('procedimiento', 'name description')
		.populate('procedimientosAgregados', 'name description')
		.populate('procedimientos', 'name description procedimiento')
		.populate('procedimientos.procedimiento', 'name description')
		.exec(function(err, procesos) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(procesos);
			}
		});
	} else {
		Proceso.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.populate('category', 'name')
		.populate('sub', 'name')
		.populate('procedimiento', 'name description')
		.populate('procedimientosAgregados', 'name description')
		.populate('procedimientos', 'name description procedimiento')
		.populate('procedimientos.procedimiento', 'name description')
		.exec(function(err, procesos) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(procesos);
			}
		});
	};
		
};

/**
 * Proceso middleware
 */
exports.procesoByID = function(req, res, next, id) { 
	Proceso.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.populate('category', 'name')
	.populate('sub', 'name')
	.populate('procedimiento', 'name description')
	.populate('procedimientosAgregados', 'name description')
	.populate('procedimientos', 'name description procedimiento')
	.populate('procedimientos.procedimiento', 'name description')
	.exec(function(err, proceso) {
		if (err) return next(err);
		if (! proceso) return next(new Error('Failed to load Proceso ' + id));
		req.proceso = proceso ;
		next();
	});
};