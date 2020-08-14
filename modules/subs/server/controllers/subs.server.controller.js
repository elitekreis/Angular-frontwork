'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Sub = mongoose.model('Sub'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Sub
 */
exports.create = function(req, res) {
	var sub = new Sub(req.body);
	sub.user = req.user;

	sub.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(sub);
		}
	});
};

/**
 * Show the current Sub
 */
exports.read = function(req, res) {
	res.jsonp(req.sub);
};

/**
 * Update a Sub
 */
exports.update = function(req, res) {
	var sub = req.sub ;

	sub = _.extend(sub , req.body);

	sub.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(sub);
		}
	});
};

/**
 * Delete an Sub
 */
exports.delete = function(req, res) {
	var sub = req.sub ;
	sub.deleted = true;
	sub.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(sub);
		}
	});
};

/**
 * List of Subs
 */
exports.list = function(req, res) { 
	var enterprise = req.query.e || null;
	if (enterprise !== null) {
		Sub.find({ enterprise: enterprise })
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, subs) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(subs);
			}
		});	
	} else {
		Sub.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, subs) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(subs);
			}
		});
	};
	
};

/**
 * Sub middleware
 */
exports.subByID = function(req, res, next, id) { 
	Sub.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.exec(function(err, sub) {
		if (err) return next(err);
		if (! sub) return next(new Error('Failed to load Sub ' + id));
		req.sub = sub ;
		next();
	});
};