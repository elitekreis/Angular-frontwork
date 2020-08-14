'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Area = mongoose.model('Area'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Area
 */
exports.create = function(req, res) {
	var area = new Area(req.body);
	area.user = req.user;

	area.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(area);
		}
	});
};

/**
 * Show the current Area
 */
exports.read = function(req, res) {
	res.jsonp(req.area);
};

/**
 * Update a Area
 */
exports.update = function(req, res) {
	console.log('entre update');
	var area = req.area ;

	area = _.extend(area , req.body);

	area.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(area);
		}
	});
};

/**
 * Delete an Area
 */
exports.delete = function(req, res) {
	var area = req.area ;
	area.deleted = true;
	area.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(area);
		}
	});
};

/**
 * List of Areas
 */
exports.list = function(req, res) {
		var enterprise = req.query.e || null;
		if (enterprise !== null) {
			Area.find({enterprise: enterprise})
			.sort('-created')
			.populate('user', 'displayName')
			.populate('parent')
			.populate('enterprise', 'name')
			.populate('sub', 'name')
			.exec(function(err, areas) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(areas);
				}
			});
		} else{
			Area.find()
			.sort('-created')
			.populate('user', 'displayName')
			.populate('parent')
			.populate('enterprise', 'name')
			.populate('sub', 'name')
			.exec(function(err, areas) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.jsonp(areas);
				}
			});
		};	
};

/**
 * Area middleware
 */
exports.areaByID = function(req, res, next, id) {
		console.log('find area');
		console.log(id);
		Area.findById(id)
		.populate('user', 'displayName')
		.populate('parent')
		.populate('enterprise', 'name')
		.populate('sub', 'name')
		.exec(function(err, area) {
		if (err) return next(err);
		if (! area) return next(new Error('Failed to load Area ' + id));
		req.area = area ;
		next();
	});
};

exports.findAreaById = function(req, res){
	var id = req.query.areaId;
	Area.findOne({_id: id})
		.populate('user', 'displayName')
		.populate('enterprise')
		.populate('parent')
		.exec(function(err, area) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} 
			else {
				console.log(area);
				res.json(area);
			}
	});
};