'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Rrhh = mongoose.model('Rrhh'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Rrhh
 */
exports.create = function(req, res) {
	var rrhh = new Rrhh(req.body);
	rrhh.user = req.user;

	rrhh.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(rrhh);
		}
	});
};

/**
 * Show the current Rrhh
 */
exports.read = function(req, res) {
	res.jsonp(req.rrhh);
};

/**
 * Update a Rrhh
 */
exports.update = function(req, res) {
	var rrhh = req.rrhh ;

	rrhh = _.extend(rrhh , req.body);

	rrhh.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(rrhh);
		}
	});
};

/**
 * Delete an Rrhh
 */
exports.delete = function(req, res) {
	var rrhh = req.rrhh ;

	rrhh.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(rrhh);
		}
	});
};

/**
 * List of Rrhhs
 */
exports.list = function(req, res) { Rrhh.find().sort('-created').populate('user', 'displayName').exec(function(err, rrhhs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(rrhhs);
		}
	});
};

/**
 * Rrhh middleware
 */
exports.rrhhByID = function(req, res, next, id) { Rrhh.findById(id).populate('user', 'displayName').exec(function(err, rrhh) {
		if (err) return next(err);
		if (! rrhh) return next(new Error('Failed to load Rrhh ' + id));
		req.rrhh = rrhh ;
		next();
	});
};