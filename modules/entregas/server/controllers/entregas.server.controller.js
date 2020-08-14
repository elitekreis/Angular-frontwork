'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Entrega = mongoose.model('Entrega'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Entrega
 */
exports.create = function(req, res) {
	var entrega = new Entrega(req.body);
	entrega.user = req.user;

	entrega.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(entrega);
		}
	});
};

/**
 * Show the current Entrega
 */
exports.read = function(req, res) {
	res.jsonp(req.entrega);
};

/**
 * Update a Entrega
 */
exports.update = function(req, res) {
	var entrega = req.entrega ;

	entrega = _.extend(entrega , req.body);

	entrega.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(entrega);
		}
	});
};

/**
 * Delete an Entrega
 */
exports.delete = function(req, res) {
	var entrega = req.entrega ;

	entrega.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(entrega);
		}
	});
};

/**
 * List of Entregas
 */
exports.list = function(req, res) { 
	var enterprise = req.query.e || null;
	if (enterprise !== null) {
		Entrega.find({enterprise: enterprise})
		.sort('-created')
		.populate('user', 'displayName')
		.exec(function(err, entregas) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(entregas);
			}
		});
	} else {
		Entrega.find()
		.sort('-created')
		.populate('user', 'displayName')
		.exec(function(err, entregas) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(entregas);
			}
		});
	};
	
};

/**
 * Entrega middleware
 */
exports.entregaByID = function(req, res, next, id) { Entrega.findById(id).populate('user', 'displayName').exec(function(err, entrega) {
		if (err) return next(err);
		if (! entrega) return next(new Error('Failed to load Entrega ' + id));
		req.entrega = entrega ;
		next();
	});
};