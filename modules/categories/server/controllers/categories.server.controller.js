'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Category = mongoose.model('Category'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Category
 */
exports.create = function(req, res) {
	var category = new Category(req.body);
	category.user = req.user;

	category.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(category);
		}
	});
};

/**
 * Show the current Category
 */
exports.read = function(req, res) {
	res.jsonp(req.category);
};

/**
 * Update a Category
 */
exports.update = function(req, res) {
	var category = req.category;
	category = _.extend(category , req.body);

	category.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(category);
		}
	});
};

/**
 * Delete an Category
 */
exports.delete = function(req, res) {
	var category = req.category ;
	category.deleted = true;
	category.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(category);
		}
	});
};

/**
 * List of Categories
 */
exports.list = function(req, res) {
	var enterprise = req.query.e || null;
	var type = req.query.type1 || null;
	if (enterprise !== null) {
		if (type !== null) {
            Category.find({enterprise: enterprise, type1: type})
			.sort('-created')
			.populate('user', 'displayName')
			.populate('enterprise', 'name')
			.exec(function(err, categories) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(categories);
				}
			});
		} else {
            Category.find({enterprise: enterprise})
			.sort('-created')
			.populate('user', 'displayName')
			.populate('enterprise', 'name')
			.exec(function(err, categories) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(categories);
				}
			});
		}

	} else {
		Category.find()
		.sort('-created')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, categories) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(categories);
			}
		});
	}
	
};

/**
 * List of Categories in Mostrador
 */
exports.listMostrador = function(req, res) {
    var enterprise = req.query.e;
	Category.find({enterprise: enterprise, deleted: false, type1: 'Producto', mostrador: true})
		.sort('name')
		.populate('user', 'displayName')
		.populate('enterprise', 'name')
		.exec(function(err, categories) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(categories);
			}
		});
};

/**
 * Category middleware
 */
exports.categoryByID = function(req, res, next, id) { 
	Category.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.populate('sub', 'name')
	.exec(function(err, category) {
		if (err) return next(err);
		if (! category) return next(new Error('Failed to load Category ' + id));
		req.category = category ;
		next();
	});
};