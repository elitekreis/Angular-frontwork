'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	mongoose = require('mongoose'),
	Costcenter = mongoose.model('Costcenter'),
	errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Costcenter
 */
exports.create = function(req, res) {
	var costcenter = new Costcenter(req.body);
	costcenter.user = req.user;

	costcenter.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(costcenter);
		}
	});
};

/**
 * Show the current Costcenter
 */
exports.read = function(req, res) {
	res.jsonp(req.costcenter);
};

/**
 * Update a Costcenter
 */
exports.update = function(req, res) {
	var costcenter = req.costcenter ;
	costcenter = _.extend(costcenter , req.body);

	costcenter.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(costcenter);
		}
	});
};

/**
 * Delete an Costcenter
 */
exports.delete = function(req, res) {
	var costcenter = req.costcenter ;
	costcenter.deleted = true;
	costcenter.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(costcenter);
		}
	});
};

/**
 * List of Costcenters
 */
exports.list = function(req, res) {
    var enterprise = req.query.e || null;

    if(enterprise !== null) {
        Costcenter.find({enterprise: enterprise})
            .sort('-created')
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .exec(function(err, costcenters) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(costcenters);
                }
            });
	} else {
        Costcenter.find()
            .sort('-created')
            .populate('user', 'displayName')
            .populate('enterprise', 'name')
            .exec(function(err, costcenters) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(costcenters);
                }
            });
	}

};

/**
 * Costcenter middleware
 */
exports.costcenterByID = function(req, res, next, id) { 
	Costcenter.findById(id)
	.populate('user', 'displayName')
	.populate('enterprise', 'name')
	.exec(function(err, costcenter) {
		if (err) return next(err);
		if (! costcenter) return next(new Error('Failed to load Costcenter ' + id));
		req.costcenter = costcenter ;
		next();
	});
};