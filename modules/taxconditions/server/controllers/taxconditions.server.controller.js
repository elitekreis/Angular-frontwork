'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Taxcondition = mongoose.model('Taxcondition'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Taxcondition
 */
exports.create = function(req, res) {
	var taxcondition = new Taxcondition(req.body);
	taxcondition.user = req.user;

	taxcondition.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(taxcondition);
		}
	});
};

/**
 * Show the current Taxcondition
 */
exports.read = function(req, res) {
	res.jsonp(req.taxcondition);
};

/**
 * Update a Taxcondition
 */
exports.update = function(req, res) {
	var taxcondition = req.taxcondition ;

	taxcondition = _.extend(taxcondition , req.body);

	taxcondition.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(taxcondition);
		}
	});
};

/**
 * Delete an Taxcondition
 */
exports.delete = function(req, res) {
	var taxcondition = req.taxcondition ;
	taxcondition.deleted = true;
	taxcondition.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(taxcondition);
		}
	});
};

/**
 * List of Taxconditions
 */
exports.list = function(req, res) {
	var enterprise = req.query.e || null;

	if (enterprise !== null) {
		Taxcondition.find({enterprise: enterprise})
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, taxconditions) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(taxconditions);
			}
		});
	} else {
		Taxcondition.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, taxconditions) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(taxconditions);
			}
		});
	}
	
};

/**
 * Taxcondition middleware
 */
exports.taxconditionByID = function(req, res, next, id) { 
	Taxcondition.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.exec(function(err, taxcondition) {
		if (err) return next(err);
		if (! taxcondition) return next(new Error('Failed to load Taxcondition ' + id));
		console.log('tax: ', taxcondition);
		req.taxcondition = taxcondition ;
		next();
	});
};