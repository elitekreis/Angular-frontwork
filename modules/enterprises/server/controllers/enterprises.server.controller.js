'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Enterprise = mongoose.model('Enterprise'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Enterprise
 */
exports.create = function(req, res) {
	var enterprise = new Enterprise(req.body);
	enterprise.user = req.user;

	enterprise.save(function(err) {
		if (err) {
			console.log('[-] Enterprise::create:Error ', err);
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(enterprise);
		}
	});
};

/**
 * Show the current Enterprise
 */
exports.read = function(req, res) {
	res.jsonp(req.enterprise);
};

/**
 * Update a Enterprise
 */
exports.update = function(req, res) {
	var enterprise = req.enterprise ;

	enterprise = _.extend(enterprise , req.body);

	enterprise.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(enterprise);
		}
	});
};

/**
 * Delete an Enterprise
 */
exports.delete = function(req, res) {
	var enterprise = req.enterprise ;
	enterprise.deleted = true;
	enterprise.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(enterprise);
		}
	});
};

/**
 * List of Enterprises
 */
exports.list = function(req, res) {
	
	var enterprise = req.query.e || null;
	if (enterprise !== null) {
		Enterprise.find({ _id: enterprise })
		.sort('-created')
		.populate('user', 'displayName')
		.exec(function(err, enterprises) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(enterprises);
			}
		});
	} else {
		Enterprise.find()
		.sort('-created')
		.populate('user', 'displayName')
		.exec(function(err, enterprises) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(enterprises);
			}
		});
	};

};

/**
 * Enterprise middleware
 */
exports.enterpriseByID = function(req, res, next, id) { Enterprise.findById(id).populate('user', 'displayName').exec(function(err, enterprise) {
		if (err) return next(err);
		if (! enterprise) return next(new Error('Failed to load Enterprise ' + id));
		req.enterprise = enterprise ;
		next();
	});
};
